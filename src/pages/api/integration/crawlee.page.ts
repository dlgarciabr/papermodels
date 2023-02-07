/* istanbul ignore file -- @preserve */
import { api } from 'src/blitz-server';
import { CheerioCrawler } from 'crawlee';
import fs from 'fs';

export default api(async (_req, res, _ctx) => {
  console.log(`
===================================================================================
|                        Starting Item integration job...                         |
===================================================================================
`);

  const crawler = new CheerioCrawler({
    minConcurrency: 10,
    maxConcurrency: 50,
    maxRequestRetries: 1,
    requestHandlerTimeoutSecs: 30,
    maxRequestsPerCrawl: 10,
    async requestHandler({ request, $, enqueueLinks, log }) {
      const title = $('title').text();
      const selector = 'article > div > h2 > a';
      log.info(`Title of ${request.loadedUrl} is '${title}'`);

      $('div > div > div > img.caption').each((index, el) => {
        void fetch(el.attribs['src']!).then(async (response) => {
          const buffer = await response.arrayBuffer();
          fs.writeFile(`image_${index}.png`, Buffer.from(buffer), () => {});
        });
      });

      // Save results as JSON to ./storage/datasets/default
      // await Dataset.pushData({ title, url: request.loadedUrl });

      // Extract links from the current page
      // and add them to the crawling queue.
      await enqueueLinks({
        selector
      });
    }
  });

  // Add first URL to the queue and start the crawl.
  await crawler.run(['https://www.paperdiorama.com/category/paper-models/work-machines']);

  res.status(200).send({});
});
