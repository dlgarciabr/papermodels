import { api } from 'src/blitz-server';
import puppeteer from 'puppeteer-serverless';
import path from 'path';
import fs from 'fs';

const downloadPath = path.resolve('./download');

export default api(async (req, res, _ctx) => {
  if (req.method === 'GET') {
    try {
      const browser = await puppeteer.launch({});
      const page = await browser.newPage();

      await page.goto('https://www.paperdiorama.com/paper-models/work-machines/john-deere-6615-paper-diorama/');

      await page.setViewport({ width: 1080, height: 1024 });

      const searchResultSelector = 'div.card-body > div > div > a.download-on-click';
      await page.waitForSelector(searchResultSelector);
      await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath
      });

      console.log(`Initializing download of file...`);

      await page.click(searchResultSelector);

      process.stdout.write('downloading');

      await checkDownloadFinished();
      console.log('');
      console.log(`File download has finished!`);
      void browser.close();

      const files = fs.readdirSync(downloadPath);

      const rs = fs.createReadStream(`${downloadPath}/${files[0]}`);

      res.setHeader('Content-Disposition', `attachment; ${files[0]}`);
      rs.pipe(res);

      res.status(200);
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
