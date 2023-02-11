/* istanbul ignore file -- @preserve */
import db, { IntegrationItemStatus } from 'db';
import { api } from 'src/blitz-server';

import { fetchPageAsString, getTextFromNodeAsString, readPageNodesAsString, readPageUrlsFromNodes } from './util';

const parseCategory = (pageContent: string, categorySelector: string, categoryBinding: any[]) => {
  const pageCategory = getTextFromNodeAsString(pageContent, categorySelector);
  return categoryBinding.find((cat) => cat.pageCategoryName === pageCategory).systemCategoryName;
};

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const pageContent = await fetchPageAsString(req.body.url);
    const pageNodes = readPageNodesAsString(pageContent, req.body.querySelector);
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
        res.status(304).end();
        return;
      }

      const categories = await db.category.findMany();

      await db.integrationItem.createMany({
        data: sanitizedUrls.map((url) => {
          const currentNode = pageNodes.find((node) => node.includes(url));
          const name = getTextFromNodeAsString(currentNode!, '*') || url;
          const categoryName = parseCategory(pageContent, req.body.categorySelector, req.body.categoryBinding);
          return {
            name,
            url,
            status: IntegrationItemStatus.pending,
            setupId: req.body.setupId,
            categoryId: categories.find((category) => category.name === categoryName)?.id || 1
          };
        })
      });
      res.status(200).send({ message: 'success' });
    } else {
      res.status(204).end();
    }
  } else {
    res.status(501).send({});
  }
});
