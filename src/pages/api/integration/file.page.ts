import { api } from 'src/blitz-server';
import chromium from 'chrome-aws-lambda';
import playwright from 'playwright-core';
import path from 'path';
import fs from 'fs';
import { streamToBuffer } from '@jorgeferrero/stream-to-buffer';
import { FileIntegration, FileIntegrationStatus, FileType } from '@prisma/client';
import { UploadItemFile } from 'src/items/types';
import { uploadFiles } from 'src/pages/items/utils';
import db from 'db';

const downloadPath = path.resolve('./download');

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    try {
      //TODO defile a better slice

      const integrationList = await db.fileIntegration.findMany({
        where: {
          status: FileIntegrationStatus.pending
        },
        take: 1
      });

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
    } catch (error) {
      res.status(501).send({ error: error.message });
    }
  } else {
    res.status(501).send({});
  }
});

const processSchemeType = async (fileIntegration: FileIntegration) => {
  const buffer = await downloadFileFromClick(fileIntegration);

  const downloadedFileWraper: UploadItemFile = {
    storagePath: '',
    item: { id: fileIntegration.itemId, files: [] },
    artifactType: FileType.scheme,
    tempId: '',
    bytes: buffer
  };

  const _uploadedFiles = await uploadFiles([downloadedFileWraper]);

  // TODO save file on DB

  // TODO update file integration on DB

  await db.fileIntegration.update({
    where: { id: fileIntegration.id },
    data: {
      status: FileIntegrationStatus.done
    }
  });

  // TODO update item integration if the file is the last one to be integrated
};

const downloadFileFromClick = async (fileIntegration: FileIntegration) => {
  // const pageUrl = 'https://www.paperdiorama.com/paper-models/work-machines/john-deere-6615-paper-diorama/';
  // const clickSelector = 'div.card-body > div > div > a.download-on-click';

  try {
    console.log('Initializing download of file...');
    console.log('Cleaning last download cache...');
    const chachedFilesToRemove = fs.readdirSync(downloadPath);
    if (chachedFilesToRemove.length > 0) {
      chachedFilesToRemove.forEach((file) => {
        fs.unlinkSync(`${downloadPath}/${file[0]}`);
      });
    }

    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const client = await context.newCDPSession(page);
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath
    });

    await page.goto(fileIntegration.url);

    await page.waitForSelector(fileIntegration.selector);

    console.log(`Initializing download of file...`);

    await page.click(fileIntegration.selector);

    process.stdout.write('downloading');

    await checkDownloadFinished();
    console.log('');
    console.log(`File download has finished!`);
    void browser.close();

    const files = fs.readdirSync(downloadPath);

    const data = await streamToBuffer(fs.createReadStream(`${downloadPath}/${files[0]}`));

    return data;
  } catch (error) {
    console.error(`Error trying to download file from ${fileIntegration.url}`);
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
