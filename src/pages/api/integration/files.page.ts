import { api } from 'src/blitz-server';
// import chromium from 'chrome-aws-lambda';
import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';
import { streamToBuffer } from '@jorgeferrero/stream-to-buffer';
import {
  FileIntegration,
  FileIntegrationStatus,
  FileType,
  IntegrationLog,
  IntegrationSetup,
  ItemIntegration,
  ItemIntegrationStatus,
  ItemStatus
} from '@prisma/client';
import db from 'db';
import { convertBytesToBase64 } from 'src/utils/storageProviders/cloudinary';
import { uploadImage } from '../file/image-upload.page';
import { UploadItemFile } from 'src/items/types';
import { readPageUrls } from './util';
import { IntegrationSelector, IntegrationSelectorType } from 'types';

const downloadPath = path.resolve('./download');

// const schemesSelectors = `
// [
//   {
//     "type":"click",
//     "selector": "div.card-body > div > div > a.download-on-click"
//   },
//   {
//     "type":"link",
//     "selector": "div.entry > div.entry-inner > h3 > a"
//   }
// ]`

interface IFileIntegration extends FileIntegration {
  itemIntegration: ItemIntegration & { setup: IntegrationSetup };
}

enum FileSimulationReference {
  hasSchemeFiles = 'Has scheme files',
  hasSchemePercentage = ' Has scheme percentege'
}

let logs: Partial<IntegrationLog>[] = [];

// TODO extract to node project, modifying DB interactions
export default api(async (req, res, _ctx) => {
  console.log(`
===================================================================================
|                       Initializing Files integration job...                     |
===================================================================================
`);
  // if (req.method === 'POST') {
  try {
    console.log('[FileIntegrationJOB] Cleaning last download cache...');
    logs = [];
    const chachedFilesToRemove = fs.readdirSync(downloadPath);
    if (chachedFilesToRemove.length > 0) {
      chachedFilesToRemove.forEach((file) => {
        fs.unlinkSync(`${downloadPath}/${file}`);
      });
    }

    //TODO defile a better slice

    const integrationList = (await db.fileIntegration.findMany({
      where: {
        OR: [
          { status: FileIntegrationStatus.pending },
          {
            AND: [
              { status: FileIntegrationStatus.simulation },
              {
                itemIntegration: {
                  log: {
                    every: {
                      reference: {
                        not: {
                          contains: FileSimulationReference.hasSchemeFiles
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      take: 5,
      include: {
        itemIntegration: {
          include: {
            setup: true
          }
        }
      }
    })) as IFileIntegration[];

    if (integrationList.length > 0) {
      await db.fileIntegration.updateMany({
        where: {
          id: {
            in: integrationList
              .filter((integration) => integration.status === FileIntegrationStatus.pending)
              .map((i) => i.id)
          }
        },
        data: {
          status: FileIntegrationStatus.running
        }
      });

      console.log(`[FileIntegrationJOB] ${integrationList.length} file(s) to be integrated found!`);
      for await (const fileIntegration of integrationList) {
        switch (fileIntegration.integrationType) {
          case FileType.scheme:
            await processSchemeType(fileIntegration);
          //TODO
          case FileType.preview:
          //TODO
          default:
          //TODO
        }
      }

      if (logs.length > 0) {
        const containsSchemeFiles = logs.filter(
          (log) => log.reference!.startsWith(FileSimulationReference.hasSchemeFiles) && log.value === 'true'
        );

        await db.integrationLog.create({
          data: {
            integrationId: integrationList[0]!.itemIntegrationId,
            reference: FileSimulationReference.hasSchemePercentage,
            value: `${String((containsSchemeFiles.length * 100) / integrationList.length)}%`
          }
        });
      }
    } else {
      console.log(`[FileIntegrationJOB] No files to be integrated.`);
    }

    // await db.itemIntegration.update({
    //   where: { id: integrationItem.id },
    //   data: {
    //     status: ItemIntegrationStatus.done
    //   }
    // });

    res.status(200).send({});
  } catch (error) {
    console.log('Error integrating files', error);
    res.status(501).send({ message: 'error', error: error.message });
  }
  // } else {
  //   res.status(501).send({});
  // }
});

const processSchemeType = async (fileIntegration: IFileIntegration) => {
  try {
    const simulation = fileIntegration.status === FileIntegrationStatus.simulation;
    const simulationLabel = simulation ? ' simulation ' : ' ';
    console.log(`-----------------------------------------------------------------------------`);
    console.log(`[FileIntegrationJOB] File ${fileIntegration.id} integration${simulationLabel}initializing.`);
    let hasShemeFiles = true;
    const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';

    const selectors = JSON.parse(fileIntegration.itemIntegration.setup.schemesSelector) as IntegrationSelector[];

    const linkSelector = selectors.find((selector) => selector.type === IntegrationSelectorType.LINK);
    const clickSelector = selectors.find((selector) => selector.type === IntegrationSelectorType.CLICK);

    if (!linkSelector && !clickSelector) {
      throw new Error('scheme selector not found');
    }

    const file: UploadItemFile = {
      storagePath: '',
      item: { id: fileIntegration.itemIntegration.itemId, files: [] },
      artifactType: fileIntegration.integrationType,
      tempId: ''
    };

    let fileUrls: string[] = [];

    if (linkSelector) {
      //try link selector
      process.stdout.write(`[FileIntegrationJOB] Trying to do integration${simulationLabel}through link selector...`);
      fileUrls = (await readPageUrls(fileIntegration.url, linkSelector.value)) as string[];

      if (fileUrls.length > 0) {
        process.stdout.write('found\n');
        if (!simulation) {
          console.log('[FileIntegrationJOB] Uploading file to storage...');
          const response = await uploadImage(
            fileUrls[0]!,
            `${ARTIFACTS_PATH}/${fileIntegration.itemIntegration.itemId}`
          );
          file.storagePath = `${response.public_id}.${response.format}`;
        }
      } else {
        process.stdout.write('not found!\n');
      }
    }

    let buffer = new ArrayBuffer(0);

    if (!file.storagePath && clickSelector) {
      //try click selector
      console.log(`[FileIntegrationJOB] Trying to do integration${simulationLabel}through click selector...`);
      buffer = await downloadFileFromClick(fileIntegration.url, clickSelector.value);
      const base64Url = convertBytesToBase64(buffer);
      if (!simulation) {
        console.log('[FileIntegrationJOB] Uploading file to storage...');
        const response = await uploadImage(base64Url, `${ARTIFACTS_PATH}/${fileIntegration.itemIntegration.itemId}`);
        file.storagePath = `${response.public_id}.${response.format}`;
      }
    }

    if (fileUrls.length === 0 && buffer.byteLength === 0) {
      if (simulation) {
        hasShemeFiles = false;
      }
      throw new Error('scheme files not found');
    }

    if (!simulation) {
      console.log('[FileIntegrationJOB] Attaching uploaded file to Item...');

      await db.itemFile.create({
        data: {
          storagePath: file.storagePath,
          artifactType: file.artifactType,
          itemId: fileIntegration.itemIntegration.itemId!
        }
      });

      await db.fileIntegration.update({
        where: { id: fileIntegration.id },
        data: {
          status: FileIntegrationStatus.done
        }
      });

      const filesToIntegrate = await db.fileIntegration.findMany({
        where: {
          AND: [
            {
              itemIntegrationId: fileIntegration.itemIntegrationId
            },
            {
              status: FileIntegrationStatus.pending
            }
          ]
        }
      });

      if (filesToIntegrate.length === 0) {
        await db.itemIntegration.update({
          where: { id: fileIntegration.itemIntegrationId },
          data: {
            status: ItemIntegrationStatus.done
          }
        });

        await db.item.update({
          where: { id: fileIntegration.itemIntegration.itemId! },
          data: {
            status: ItemStatus.enable
          }
        });
        console.log(
          `[FileIntegrationJOB] Item integration ${fileIntegration.itemIntegration.itemId} has successfully finished!`
        );
      }
    }

    console.log(
      `[FileIntegrationJOB] File integration${simulationLabel}id ${fileIntegration.id} has successfully finished!`
    );

    if (simulation) {
      logs.push({
        integrationId: fileIntegration.itemIntegrationId,
        reference: `${FileSimulationReference.hasSchemeFiles}: ${fileIntegration.id}`,
        value: String(hasShemeFiles)
      });
      await db.integrationLog.createMany({
        data: logs as IntegrationLog[]
      });
    }
  } catch (error) {
    console.log('error', error);
    // TODO save error on integration table
    await db.fileIntegration.update({
      where: { id: fileIntegration.id },
      data: {
        status: FileIntegrationStatus.error
      }
    });
    // await db.itemIntegration.update({
    //   where: { id: fileIntegration.itemIntegrationId },
    //   data: {
    //     status: ItemIntegrationStatus.error,
    //     error
    //   }
    // });
  }
};

const downloadFileFromClick = async (url: string, selector: string) => {
  try {
    console.log('[FileIntegrationJOB] Initializing download of file...');

    const browser = await chromium.launch({
      // args: chromium.args,
      // executablePath: await chromium.executablePath,
      // headless: chromium.headless
      headless: true
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const client = await context.newCDPSession(page);
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath
    });

    await page.goto(url);

    await page.waitForSelector(selector);

    await page.click(selector);

    process.stdout.write('[FileIntegrationJOB] ');

    await checkDownloadFinished();

    void browser.close();
    console.log(`\n[FileIntegrationJOB] File download has finished!`);

    const filesDownloaded = fs.readdirSync(downloadPath);

    if (filesDownloaded.length === 0) {
      throw Error('[FileIntegrationJOB] Downloaded files dir is empty.');
    }

    const downloadedFile = fs.createReadStream(`${downloadPath}/${filesDownloaded[0]}`);
    const data = await streamToBuffer(downloadedFile);

    return data;
  } catch (error) {
    console.error(`[FileIntegrationJOB] Error trying to download file from ${url}`);
    throw error;
  }
};

const checkDownloadFinished = async () => {
  process.stdout.write('.');
  const files = fs.readdirSync(downloadPath);
  if (files.length === 0 || files[0]!.indexOf('crdownload') > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return checkDownloadFinished();
  }
  return true;
};
