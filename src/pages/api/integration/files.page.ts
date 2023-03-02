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
import { executeSelectorAllOnHtmlText, fetchPageAsString, readPageUrls } from './util';
import {
  FileSimulationReference,
  IntegrationProcessingType,
  IntegrationSelector,
  IntegrationSelectorType,
  ItemSimulationReference,
  SystemParameterType
} from 'types';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import formatDuration from 'date-fns/formatDuration';

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
    logs = [];
    await processIntegration();

    res.status(200).send({});
  } catch (error) {
    console.log('Error integrating files', error);
    res.status(501).send({ message: 'error', error: error.message });
  }
});

const processSchemeType = async (fileIntegration: IFileIntegration, isSimulation: boolean) => {
  try {
    let fileIntegrationLogs: Partial<IntegrationLog>[] = [];
    const simulationLabel = isSimulation ? ' simulation ' : ' ';
    console.log(`-----------------------------------------------------------------------------`);
    console.log(
      `[FileIntegrationJOB] File ${fileIntegration.itemIntegration.name} integration${simulationLabel}initializing.`
    );
    let hasShemeFiles = true;
    const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';

    const selectors = JSON.parse(fileIntegration.itemIntegration.setup.schemesSelector) as IntegrationSelector[];

    const linkSelectors = selectors.filter((selector) => selector.type === IntegrationSelectorType.LINK);
    const clickSelectors = selectors.filter((selector) => selector.type === IntegrationSelectorType.CLICK);

    if (linkSelectors.length === 0 && clickSelectors.length === 0) {
      throw new Error('scheme selectors not found');
    }

    const errors: string[] = [];

    const files: UploadItemFile[] = [];

    try {
      let filesUrls: string[] = [];

      if (linkSelectors.length > 0) {
        console.log(`[FileIntegrationJOB] Trying to do integration${simulationLabel}through link selector...`);

        for await (const linkSelector of linkSelectors) {
          const selectorFilesUrls = (await readPageUrls(fileIntegration.url, linkSelector.value)) as string[];
          if (selectorFilesUrls.length > 0) {
            console.log('[FileIntegrationJOB] file found from link selector!');

            const file: UploadItemFile = {
              storagePath: '',
              item: { id: fileIntegration.itemIntegration.itemId, files: [] },
              artifactType: fileIntegration.integrationType,
              tempId: ''
            };

            if (isSimulation) {
              file.storagePath = 'simulation';
            } else {
              console.log('[FileIntegrationJOB] Uploading file to storage...');
              try {
                const response = await uploadImage(
                  selectorFilesUrls[0]!,
                  `${ARTIFACTS_PATH}/${fileIntegration.itemIntegration.itemId}`
                );
                file.storagePath = `${response.public_id}.${response.format}`;
              } catch (error) {
                await db.integrationLog.create({
                  data: {
                    key: FileSimulationReference.error,
                    reference: `linkSelector:${selectorFilesUrls[0]}`,
                    error: error.message,
                    value: error.stack || error.message || ''
                  }
                });
              }
            }
            if (file.storagePath) {
              filesUrls = [...filesUrls, ...selectorFilesUrls];
              files.push(file);
            }
          }
        }
        console.log('[FileIntegrationJOB] URLs found from Link selector: ', filesUrls.length);
      }

      let hasBufferFiles = false;

      if (clickSelectors.length > 0) {
        console.log(`[FileIntegrationJOB] Trying to do integration${simulationLabel}through click selector...`);

        for await (const clickSelector of clickSelectors) {
          const pageContent = await fetchPageAsString(fileIntegration.url);
          const nodes = executeSelectorAllOnHtmlText(pageContent, clickSelector.value);
          let index = 0;
          for await (const _iterator of nodes) {
            const buffer = await downloadFileFromClick(fileIntegration.url, clickSelector.value, index);
            const base64Url = convertBytesToBase64(buffer);

            const file: UploadItemFile = {
              storagePath: '',
              item: { id: fileIntegration.itemIntegration.itemId, files: [] },
              artifactType: fileIntegration.integrationType,
              tempId: ''
            };

            if (buffer.byteLength > 0) {
              if (!isSimulation) {
                console.log('[FileIntegrationJOB] Uploading file to storage...');
                try {
                  const response = await uploadImage(
                    base64Url,
                    `${ARTIFACTS_PATH}/${fileIntegration.itemIntegration.itemId}`
                  );
                  file.storagePath = `${response.public_id}.${response.format}`;
                } catch (error) {
                  await db.integrationLog.create({
                    data: {
                      key: FileSimulationReference.error,
                      reference: `clickSelector:${fileIntegration.itemIntegration.name}`,
                      error: error.message,
                      value: error.stack || error.message || ''
                    }
                  });
                }
              }
              if (file.storagePath) {
                hasBufferFiles = true;
                files.push(file);
              }
            }

            clearCachedFiles();
            index++;
          }
        }
      }

      if (files.length === 0 && hasBufferFiles) {
        throw new Error('scheme files not found');
      }
    } catch (error) {
      hasShemeFiles = false;
      errors.push(error.message);
    }

    if (isSimulation) {
      console.log('[FileIntegrationJOB] Saving logs...');
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
    } else {
      console.log('[FileIntegrationJOB] Attaching uploaded files to Item...');

      await db.itemFile.createMany({
        data: files.map((file) => ({
          storagePath: file.storagePath,
          artifactType: file.artifactType,
          itemId: fileIntegration.itemIntegration.itemId!
        }))
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
            status: hasShemeFiles ? ItemStatus.enable : ItemStatus.validate
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

    if (errors.length > 0) {
      throw new Error(errors.join(';\n'));
    }
  } catch (error) {
    if (isSimulation) {
      await db.integrationLog.create({
        data: {
          integrationId: fileIntegration.itemIntegrationId,
          key: FileSimulationReference.error,
          reference: fileIntegration.itemIntegration.name,
          value: error.message
        }
      });
    } else {
      await db.fileIntegration.update({
        where: { id: fileIntegration.id },
        data: {
          status: FileIntegrationStatus.error,
          error: error.message
        }
      });
      await db.integrationLog.create({
        data: {
          key: FileIntegrationStatus.error,
          reference: fileIntegration.url,
          error: error.message,
          value: (error as Error).stack || error.message
        }
      });
    }
  }
};

const downloadFileFromClick = async (url: string, selector: string, index: number) => {
  try {
    console.log('[FileIntegrationJOB] Initializing download of file from: ');

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

    // await page.click(selector);//TODO remove if the code below is working
    const locator = page.locator(selector).nth(index);
    await locator.click({ timeout: 60000 });

    process.stdout.write('[FileIntegrationJOB] ');

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

const checkDownloadFinished = async (): Promise<void> => {
  process.stdout.write('.');
  const files = fs.readdirSync(downloadPath);
  if (files.length === 0 || files[0]!.indexOf('crdownload') > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return checkDownloadFinished();
  }
  return Promise.resolve();
};

const clearCachedFiles = () => {
  const chachedFilesToRemove = fs.readdirSync(downloadPath);
  if (chachedFilesToRemove.length > 0) {
    chachedFilesToRemove.forEach((file) => {
      fs.unlinkSync(`${downloadPath}/${file}`);
    });
  }
};

const processIntegration = async () => {
  console.log('[FileIntegrationJOB] Cleaning last download cache...');

  clearCachedFiles();

  const params = await db.systemParameter.findMany({
    where: {
      OR: [{ key: SystemParameterType.INTEGRATION_TYPE }, { key: SystemParameterType.INTEGRATION_START_TIME }]
    }
  });

  const paramProcessingType = params.find((param) => param.key === SystemParameterType.INTEGRATION_TYPE);

  if (!paramProcessingType) {
    console.log(`[FileIntegrationJOB] Nothing to be done, quiting!`);
    return { message: 'ok' };
  }

  const type = paramProcessingType!.value as unknown as IntegrationProcessingType;
  const isSimulation = type === IntegrationProcessingType.SIMULATION;

  let slice = 5;
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
          await processSchemeType(fileIntegration, isSimulation);
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

    // if (isSimulation) {
    const fileIntegrations = await db.fileIntegration.findMany({
      where: {
        OR: [
          { status: FileIntegrationStatus.pendingSimulation },
          { status: FileIntegrationStatus.pending },
          { status: FileIntegrationStatus.simulated },
          { status: FileIntegrationStatus.done }
        ]
      }
    });

    const pendingFileIntegrations = fileIntegrations.filter(
      (sim) => sim.status === FileIntegrationStatus.pendingSimulation || sim.status === FileIntegrationStatus.pending
    );
    const finishedFileIntegrations = fileIntegrations.filter(
      (sim) => sim.status === FileIntegrationStatus.simulated || sim.status === FileIntegrationStatus.done
    );

    if (pendingFileIntegrations.length === 0) {
      const pendingItemIntegrations = await db.itemIntegration.count({
        where: {
          OR: [{ status: ItemIntegrationStatus.pendingSimulation }, { status: ItemIntegrationStatus.pending }]
        }
      });

      if (pendingItemIntegrations === 0) {
        console.log(`[FileIntegrationJOB] Saving final Logs...`);

        const containsSchemeFiles = logs.filter(
          (log) => log.key === FileSimulationReference.hasSchemeFiles && log.value === 'true'
        );

        await db.integrationLog.deleteMany({
          where: {
            value: `${true}`
          }
        });

        const paramStartTime = params.find((param) => param.key === SystemParameterType.INTEGRATION_START_TIME);
        const startTime = new Date(Number(paramStartTime!.value));

        let duration = 0;
        let rest = 0;
        const diff = differenceInSeconds(new Date(), startTime);
        if (diff >= 60) {
          duration = Math.round(diff / 60);
          rest = diff % 60;
        }

        const totalDuration = formatDuration(
          {
            minutes: duration,
            seconds: rest
          },
          { delimiter: ', ' }
        );

        await db.integrationLog.createMany({
          data: [
            {
              key: FileSimulationReference.schemePercentage,
              reference: 'Global',
              value: `${String(Math.round((containsSchemeFiles.length * 100) / finishedFileIntegrations.length))}%`
            },
            {
              key: ItemSimulationReference.totalTime,
              reference: 'Global',
              value: totalDuration
            }
          ]
        });

        console.log(`[FileIntegrationJOB] Cleaning System Parameters...`);

        await db.systemParameter.deleteMany({
          where: {
            OR: [
              { key: SystemParameterType.INTEGRATION_QUANTITY },
              { key: SystemParameterType.INTEGRATION_START_TIME },
              { key: SystemParameterType.INTEGRATION_ITEM_NAME },
              { key: SystemParameterType.INTEGRATION_ITEM_REPLACE }
            ]
          }
        });
        console.log(`
===================================================================================
                  Integration finished in ${totalDuration}                    
===================================================================================`);
      }
    }
    // }

    if (isSimulation) {
      await processIntegration();
    }
  } else {
    console.log(`[FileIntegrationJOB] No files to be integrated.`);
  }
};
