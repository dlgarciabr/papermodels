import { api } from 'src/blitz-server';
// import puppeteer from 'puppeteer-serverless';
// import chromium from "chrome-aws-lambda"
// import playwright from "playwright-core"
import { chromium } from 'playwright-core';
import path from 'path';
import fs from 'fs';

const downloadPath = path.resolve('./download');

export default api(async (req, res, _ctx) => {
  if (req.method === 'GET') {
    try {
      // const browser = await puppeteer.launch({});
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
      // const browser = await chromium.launch({
      //   args: chromium.args,
      //   executablePath:
      //     process.env.NODE_ENV !== "development"
      //       ? await chromium.executablePath
      //       : "/usr/bin/chromium",
      //   headless: process.env.NODE_ENV !== "development" ? chromium.headless : true,
      // })
      const page = await context.newPage();

      const client = await context.newCDPSession(page);
      await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        // This path must match the WORKSPACE_DIR in Step 1
        downloadPath
      });

      await page.goto('https://www.paperdiorama.com/paper-models/work-machines/john-deere-6615-paper-diorama/');

      // await page.setViewport({ width: 1080, height: 1024 });

      const searchResultSelector = 'div.card-body > div > div > a.download-on-click';
      await page.waitForSelector(searchResultSelector);
      // await page._client.send('Page.setDownloadBehavior', {
      //   behavior: 'allow',
      //   downloadPath: downloadPath
      // });

      console.log(`Initializing download of file...`);

      await page.click(searchResultSelector);

      // page.on('download', download => {
      //   console.log(download.suggestedFilename);
      //   res.status(200);
      // })

      // const download = await page.waitForEvent("download", {
      //   timeout: 60000
      // });

      process.stdout.write('downloading');

      // const rs = await download.createReadStream()

      await checkDownloadFinished();
      console.log('');
      console.log(`File download has finished!`);
      void browser.close();

      const files = fs.readdirSync(downloadPath);

      const rs = fs.createReadStream(`${downloadPath}/${files[0]}`);

      if (rs) {
        res.setHeader('Content-Disposition', `attachment; ${files[0]}`);
        rs.pipe(res);
      }
    } catch (error) {
      res.status(200).send({ error: error.message });
    }
  } else {
    res.status(501).send({});
  }
});

const checkDownloadFinished = async () => {
  process.stdout.write('.');
  const files = fs.readdirSync(downloadPath);
  if (files.length === 0 || files[0]!.indexOf('crdownload') > 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return checkDownloadFinished();
  }
  return true;
};
