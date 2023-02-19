/* istanbul ignore file -- @preserve */
import db, { IntegrationSetup, ItemIntegration, ItemIntegrationStatus } from 'db';
import { api } from 'src/blitz-server';
import { IntegrationProcessingType, IntegrationSelector, ItemSimulationReference } from 'types';

import { fetchPageAsString, getAllSiteUrls, getItemUrlsFromPage, getTextFromNodeAsString } from './util';

const parseCategory = (pageContent: string, categorySelector: string, categoryBinding: any[]): string | null => {
  try {
    const pageCategory = getTextFromNodeAsString(pageContent, categorySelector);
    return categoryBinding.find((cat) => cat.pageCategoryName.toLowerCase() === pageCategory?.toLowerCase())
      .systemCategoryName;
  } catch (error) {
    return null;
  }
};

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const setup = req.body as IntegrationSetup;
    const type = req.body.type as IntegrationProcessingType;

    // const pageContent = await fetchPageAsString(setup.domain);

    const itemUrlSelectors = JSON.parse(setup.itemUrlSelector) as IntegrationSelector[];
    let pageNodes: string[] = [];
    // itemUrlSelectors.forEach((selector) => {
    //   const nodes = readPageNodesAsString(pageContent, selector.value);
    //   pageNodes = [...pageNodes, ...nodes];
    // });

    const siteSanitizedUrls = await getAllSiteUrls(setup.domain, setup.key);

    let siteUrls: any[] = [];

    for await (const url of siteSanitizedUrls.slice(0, siteSanitizedUrls.length / 10)) {
      const urls = await getItemUrlsFromPage(url, itemUrlSelectors);
      siteUrls = [...siteUrls, ...urls];
    }

    siteUrls = Array.from(new Set(siteUrls));

    // const pageUrls = readPageUrlsFromNodes(pageNodes) as string[];

    await db.itemIntegration.deleteMany({
      where: {
        OR: [{ status: ItemIntegrationStatus.pendingSimulation }, { status: ItemIntegrationStatus.simulated }]
      }
    });

    await db.integrationLog.deleteMany({
      where: {
        integrationId: null
      }
    });

    if (siteUrls.length === 0) {
      res.status(204).end();
      return;
    }

    if (type === IntegrationProcessingType.READ_URLS) {
      await db.integrationLog.createMany({
        data: [
          {
            key: ItemSimulationReference.initialQuantity,
            reference: 'Global',
            value: siteUrls.length.toString()
          },
          ...siteUrls.map((url) => ({
            key: ItemSimulationReference.url,
            reference: 'Global',
            value: url
          }))
        ]
      });
      res.status(200).end();
      return;
    }

    const integrations = await db.itemIntegration.findMany({
      where: {
        url: {
          in: siteUrls
        }
      }
    });

    const existingUrls = integrations.map((integrationItem) => integrationItem.url);

    let sanitizedSiteUrls: string[];

    if (existingUrls.length === 0) {
      sanitizedSiteUrls = [...siteUrls];
    } else {
      sanitizedSiteUrls = siteUrls.filter((pageUrl) => !existingUrls.some((existingUrl) => pageUrl === existingUrl));
    }

    if (sanitizedSiteUrls.length === 0) {
      res.status(304).end();
      return;
    }

    const categories = await db.category.findMany();

    const itemsToIntegrate: Partial<ItemIntegration & { hasCategory: boolean }>[] = [];

    for await (const url of sanitizedSiteUrls) {
      const pageContent = await fetchPageAsString(url);
      const currentNode = pageNodes.find((node) => node.includes(url));
      const name = getTextFromNodeAsString(currentNode!, '*') || url;
      const categorySelectors = JSON.parse(setup.categorySelector) as IntegrationSelector[];

      let categoryName: string | null = null;

      categorySelectors.forEach((selector) => {
        if (!categoryName) {
          categoryName = parseCategory(pageContent, selector.value, JSON.parse(req.body.categoryBinding));
        }
      });

      itemsToIntegrate.push({
        name,
        url,
        status:
          type === IntegrationProcessingType.SIMULATION
            ? ItemIntegrationStatus.pendingSimulation
            : ItemIntegrationStatus.pending,
        setupId: setup.id,
        categoryId: categories.find((category) => category.name === categoryName)?.id || 1,
        hasCategory: !!categoryName
      });
    }

    for await (const item of itemsToIntegrate) {
      await db.itemIntegration.create({
        data: {
          name: item.name!,
          url: item.url!,
          status: item.status!,
          setupId: item.setupId!,
          categoryId: item.categoryId!,
          logs: {
            create: {
              key: ItemSimulationReference.hasCategory,
              reference: item.name!,
              value: String(item.hasCategory)
            }
          }
        }
      });
    }
    // const createReturn = await db.itemIntegration.createMany({
    //   data: itemsToIntegrate.map(item => ({
    //     name: item.name!,
    //     url: item.url!,
    //     status: item.status!,
    //     setupId: item.setupId!,
    //     categoryId: item.categoryId!,
    //     logs: {
    //       create: {
    //         key: ItemSimulationReference.hasCategory,
    //         reference: item.name,
    //         value: item.hasCategory
    //       }
    //     }
    //   }))
    // });

    const itemsWithCategory = itemsToIntegrate.filter((item) => item.hasCategory);

    await db.integrationLog.createMany({
      data: [
        {
          key: ItemSimulationReference.initialQuantity,
          reference: 'Global',
          value: itemsToIntegrate.length.toString()
        },
        {
          key: ItemSimulationReference.categoryPercentage,
          reference: 'Global',
          value: `${String((itemsWithCategory.length * 100) / itemsToIntegrate.length)}%`
        }
      ]
    });

    res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
