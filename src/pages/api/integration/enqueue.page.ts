/* istanbul ignore file -- @preserve */
import db, { IntegrationSetup, ItemIntegrationStatus } from 'db';
import { api } from 'src/blitz-server';
import { IntegrationSelector } from 'types';

import { fetchPageAsString, getTextFromNodeAsString, readPageNodesAsString, readPageUrlsFromNodes } from './util';

const parseCategory = (pageContent: string, categorySelector: string, categoryBinding: any[]) => {
  const pageCategory = getTextFromNodeAsString(pageContent, categorySelector);
  return categoryBinding.find((cat) => cat.pageCategoryName.toLowerCase() === pageCategory?.toLowerCase())
    .systemCategoryName;
};

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const setup = req.body as IntegrationSetup;
    const simulation = req.body.simulate as boolean;
    const pageContent = await fetchPageAsString(setup.domain);

    const itemUrlSelectors = JSON.parse(setup.itemUrlSelector) as IntegrationSelector[];
    let pageNodes: string[] = [];
    itemUrlSelectors.forEach((selector) => {
      const nodes = readPageNodesAsString(pageContent, selector.value);
      pageNodes = [...pageNodes, ...nodes];
    });

    const pageUrls = readPageUrlsFromNodes(pageNodes) as string[];

    if (pageUrls.length === 0) {
      res.status(204).end();
      return;
    }

    await db.itemIntegration.deleteMany({
      where: {
        status: ItemIntegrationStatus.simulation
      }
    });

    const integrations = await db.itemIntegration.findMany({
      where: {
        url: {
          in: pageUrls
        }
      }
    });

    const existingUrls = integrations.map((integrationItem) => integrationItem.url);

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

    await db.itemIntegration.createMany({
      data: sanitizedUrls.map((url) => {
        const currentNode = pageNodes.find((node) => node.includes(url));
        const name = getTextFromNodeAsString(currentNode!, '*') || url;
        const categorySelectors = JSON.parse(setup.categorySelector) as IntegrationSelector[];

        let categoryName = '';

        categorySelectors.forEach((selector) => {
          if (!categoryName) {
            categoryName = parseCategory(pageContent, selector.value, JSON.parse(req.body.categoryBinding));
          }
        });

        return {
          name,
          url,
          status: simulation ? ItemIntegrationStatus.simulation : ItemIntegrationStatus.pending,
          setupId: setup.id,
          categoryId: categories.find((category) => category.name === categoryName)?.id || 1
        };
      })
    });

    res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
