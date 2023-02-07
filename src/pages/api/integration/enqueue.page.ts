/* istanbul ignore file -- @preserve */
import db, { IntegrationItemStatus } from 'db';
import { api } from 'src/blitz-server';

import { getTextFromNodeAsString, readPageNodesAsString, readPageUrlsFromNodes } from './util';

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const pageNodes = await readPageNodesAsString(req.body.url, req.body.querySelector);
    const pageUrls = readPageUrlsFromNodes(pageNodes) as string[];

    if (pageUrls.length > 0) {
      const existingUrls = (
        await db.integrationItem.findMany({
          where: {
            url: {
              in: pageUrls
            }
          },
          select: {
            url: true
          }
        })
      ).map((integrationItem) => integrationItem.url);

      let sanitizedUrls: string[];

      if (existingUrls.length === 0) {
        sanitizedUrls = [...pageUrls];
      } else {
        sanitizedUrls = pageUrls.filter((pageUrl) => !existingUrls.some((existingUrl) => pageUrl === existingUrl));
      }

      if (sanitizedUrls.length === 0) {
        res.status(304).send({});
        return;
      }

      await db.integrationItem.createMany({
        data: sanitizedUrls.map((url) => {
          const currentNode = pageNodes.find((node) => node.includes(url));
          const name = getTextFromNodeAsString(currentNode!, '*') || url;
          return {
            name,
            url,
            status: IntegrationItemStatus.pending
          };
        })
      });
      res.status(200).send({ message: 'success' });
    } else {
      res.status(204).send({});
    }
  } else {
    res.status(501).send({});
  }
});
