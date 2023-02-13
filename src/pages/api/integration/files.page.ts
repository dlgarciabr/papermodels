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
    const chachedFilesToRemove = fs.readdirSync(downloadPath);
    if (chachedFilesToRemove.length > 0) {
      chachedFilesToRemove.forEach((file) => {
        fs.unlinkSync(`${downloadPath}/${file}`);
      });
    }

    //TODO defile a better slice

    const integrationList = (await db.fileIntegration.findMany({
      where: {
        status: FileIntegrationStatus.pending
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
            in: integrationList.map((i) => i.id)
          }
        },
        data: {
          status: FileIntegrationStatus.running
        }
      });

      console.log(`[FileIntegrationJOB] ${integrationList.length} file(s) to be integrated found!`);
      for await (const fileIntegration of integrationList) {
        console.log(`-----------------------------------------------------------------------------`);
        console.log(`[FileIntegrationJOB] File integration ${fileIntegration.id} initializing.`);
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
    res.status(501).send({ message: 'error', error: error.message });
  }
  // } else {
  //   res.status(501).send({});
  // }
});

const processSchemeType = async (fileIntegration: IFileIntegration) => {
  try {
    const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';

    const selectors = JSON.parse(fileIntegration.itemIntegration.setup.schemesSelector) as IntegrationSelector[];

    const linkSelector = selectors.find((selector) => selector.type === IntegrationSelectorType.LINK);
    const clickSelector = selectors.find((selector) => selector.type === IntegrationSelectorType.CLICK);

    if (!linkSelector && !clickSelector) {
      throw new Error('scheme selector not found');
    }

    const file: UploadItemFile = {
      storagePath: '',
      item: { id: fileIntegration.itemId, files: [] },
      artifactType: fileIntegration.integrationType,
      tempId: ''
    };

    if (linkSelector) {
      //try link selector
      process.stdout.write('[FileIntegrationJOB] Trying to integrate through link selector...');
      const fileUrl = await readPageUrls(fileIntegration.url, linkSelector.value);

      if (fileUrl.length > 0) {
        process.stdout.write('found\n');
        console.log('[FileIntegrationJOB] Uploading file to storage...');
        const response = await uploadImage(fileUrl[0]!, `${ARTIFACTS_PATH}/${fileIntegration.itemId}`);
        file.storagePath = `${response.public_id}.${response.format}`;
      } else {
        process.stdout.write('not found!\n');
      }
    }

    if (!file.storagePath && clickSelector) {
      //try click selector
      console.log('[FileIntegrationJOB] Trying to integrate through click selector...');
      const buffer = await downloadFileFromClick(fileIntegration.url, clickSelector.value);
      const base64Url = convertBytesToBase64(buffer);

      console.log('[FileIntegrationJOB] Uploading file to storage...');
      const response = await uploadImage(base64Url, `${ARTIFACTS_PATH}/${fileIntegration.itemId}`);
      file.storagePath = `${response.public_id}.${response.format}`;
    }

    console.log('[FileIntegrationJOB] Attaching uploaded file to Item...');

    await db.itemFile.create({
      data: {
        storagePath: file.storagePath,
        artifactType: file.artifactType,
        itemId: fileIntegration.itemId
      }
    });

    await db.fileIntegration.update({
      where: { id: fileIntegration.id },
      data: {
        status: FileIntegrationStatus.done
      }
    });

    console.log(`[FileIntegrationJOB] File integration ${fileIntegration.id} has successfully finished!`);

    const filesToIntegrate = await db.fileIntegration.findMany({
      where: {
        // itemIntegrationId: fileIntegration.itemIntegrationId
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
        where: { id: fileIntegration.itemId },
        data: {
          status: ItemStatus.enable
        }
      });
      console.log(`[FileIntegrationJOB] Item integration ${fileIntegration.itemId} has successfully finished!`);
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
