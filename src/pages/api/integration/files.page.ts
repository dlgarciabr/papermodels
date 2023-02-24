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
import {
  FileSimulationReference,
  IntegrationProcessingType,
  IntegrationSelector,
  IntegrationSelectorType
} from 'types';

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

let logs: Partial<IntegrationLog>[] = [];

// TODO extract to node project, modifying DB interactions
export default api(async (req, res, _ctx) => {
  console.log(`
===================================================================================
|                       Initializing Files integration job...                     |
===================================================================================
`);
  try {
    const runningIntegrations = await db.fileIntegration.findMany({
      where: {
        OR: [{ status: FileIntegrationStatus.running }, { status: FileIntegrationStatus.runningSimulation }]
      }
    });

    if (runningIntegrations.length > 0) {
      console.log('[FileIntegrationJOB] Another File integration job is running, aborting...');
      return;
    }

    console.log('[FileIntegrationJOB] Cleaning last download cache...');
    logs = [];
    const chachedFilesToRemove = fs.readdirSync(downloadPath);
    if (chachedFilesToRemove.length > 0) {
      chachedFilesToRemove.forEach((file) => {
        fs.unlinkSync(`${downloadPath}/${file}`);
      });
    }

    const paramProcessingType = await db.systemParameter.findFirst({
      where: {
        key: 'IntegrationProcessingType'
      }
    });

    if (!paramProcessingType) {
      console.log(`[FileIntegrationJOB] Nothing to be done, quiting!`);
      return { message: 'ok' };
    }

    const type = paramProcessingType!.value as unknown as IntegrationProcessingType;

    let slice = 5;

    const isSimulation = type === IntegrationProcessingType.SIMULATION;

    if (isSimulation) {
      slice = 10;
    }

    //TODO defile a better slice

    const integrationList = (await db.fileIntegration.findMany({
      where: {
        OR: [{ status: FileIntegrationStatus.pending }, { status: FileIntegrationStatus.pendingSimulation }]
      },
      take: slice,
      include: {
        itemIntegration: {
          include: {
            setup: true
          }
        }
      }
    })) as IFileIntegration[];

    if (integrationList.length > 0) {
      const fileIntegrationIds = integrationList.map((i) => i.id);

      await db.fileIntegration.updateMany({
        where: {
          id: {
            in: fileIntegrationIds
          }
        },
        data: {
          status: isSimulation ? FileIntegrationStatus.runningSimulation : FileIntegrationStatus.running
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

      const newStatus = isSimulation ? FileIntegrationStatus.simulated : FileIntegrationStatus.done;

      console.log(`[FileIntegrationJOB] Updating FileIntegrations status to ${newStatus} ...`);

      await db.fileIntegration.updateMany({
        where: {
          id: {
            in: fileIntegrationIds
          }
        },
        data: {
          status: newStatus
        }
      });

      if (isSimulation) {
        const pendingSimulations = await db.fileIntegration.findMany({
          where: {
            status: FileIntegrationStatus.pendingSimulation
          },
          select: {
            itemIntegration: {
              select: {
                logs: true
              }
            }
          }
        });

        if (pendingSimulations.length === 0) {
          console.log(`[FileIntegrationJOB] Persisting Logs...`);

          const containsSchemeFiles = logs.filter(
            (log) => log.key === FileSimulationReference.hasSchemeFiles && log.value === 'true'
          );

          await db.integrationLog.create({
            data: {
              key: FileSimulationReference.schemePercentage,
              reference: 'Global',
              value: `${String(Math.round((containsSchemeFiles.length * 100) / integrationList.length))}%`
            }
          });
        }
      }
    } else {
      console.log(`[FileIntegrationJOB] No files to be integrated.`);
    }

    res.status(200).send({});
  } catch (error) {
    console.log('Error integrating files', error);
    res.status(501).send({ message: 'error', error: error.message });
  }
});

const processSchemeType = async (fileIntegration: IFileIntegration) => {
  const simulation = fileIntegration.status === FileIntegrationStatus.pendingSimulation;
  try {
    let fileIntegrationLogs: Partial<IntegrationLog>[] = [];
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
        if (simulation) {
          file.storagePath = 'simulation';
        } else {
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
      fileIntegrationLogs.push({
        integrationId: fileIntegration.itemIntegrationId,
        key: FileSimulationReference.hasSchemeFiles,
        reference: fileIntegration.itemIntegration.name,
        value: String(hasShemeFiles)
      });
      logs = [...logs, ...fileIntegrationLogs];
      await db.integrationLog.createMany({
        data: fileIntegrationLogs as IntegrationLog[]
      });
    }
  } catch (error) {
    if (simulation) {
      await db.integrationLog.create({
        data: {
          integrationId: fileIntegration.itemIntegrationId,
          key: FileSimulationReference.error,
          reference: fileIntegration.itemIntegration.name,
          value: (error as Error).message
        }
      });
    } else {
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

    // await checkDownloadFinished();

    await Promise.race([checkDownloadFinished(), new Promise((resolve) => setTimeout(resolve, 60000))]);

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
  return;
};
