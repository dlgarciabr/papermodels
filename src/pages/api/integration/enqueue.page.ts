/* istanbul ignore file -- @preserve */
import db, { IntegrationSetup, ItemIntegrationStatus, UrlIntegrationStatus } from 'db';
import { api } from 'src/blitz-server';
import { IntegrationProcessingType } from 'types';

import { getAllSiteUrls } from './util';

// const parseCategory = (pageContent: string, categorySelector: string, categoryBinding: any[]): string | null => {
//   try {
//     const pageCategory = getTextFromNodeAsString(pageContent, categorySelector);
//     return categoryBinding.find((cat) => cat.pageCategoryName.toLowerCase() === pageCategory?.toLowerCase())
//       .systemCategoryName;
//   } catch (error) {
//     return null;
//   }
// };

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const setup = req.body as IntegrationSetup;
    const type = req.body.type as IntegrationProcessingType;

    if (!setup) {
      res.status(500).send({ message: 'IntegrationSetup not defined' });
      return;
    }

    if (!type) {
      res.status(500).send({ message: 'IntegrationProcessingType not defined' });
      return;
    }

    // const itemUrlSelectors = JSON.parse(setup.itemUrlSelector) as IntegrationSelector[];
    // let pageNodes: string[] = [];

    const uniqueSiteUrls = await getAllSiteUrls(setup.domain, setup.key);

    // let itemsUrls: any[] = [];

    await db.integrationLog.deleteMany({
      where: {
        integrationId: null
      }
    });

    await db.itemIntegration.deleteMany({
      where: {
        OR: [{ status: ItemIntegrationStatus.pendingSimulation }, { status: ItemIntegrationStatus.simulated }]
      }
    });

    await db.urlIntegration.deleteMany({
      where: {
        OR: [
          { status: UrlIntegrationStatus.readingPending },
          { status: UrlIntegrationStatus.readingDone },
          { status: UrlIntegrationStatus.simulationPending },
          { status: UrlIntegrationStatus.simulationDone }
        ]
      }
    });

    // if (type === IntegrationProcessingType.READ_URLS) {
    //   await db.urlIntegration.createMany({
    //     data: uniqueSiteUrls.map((url) => ({
    //       status: UrlIntegrationStatus.readingPending, //TODO rename enum property
    //       url,
    //       setupId: setup.id
    //     }))
    //   });
    // } else if (type === IntegrationProcessingType.SIMULATION) {
    //   await db.urlIntegration.createMany({
    //     data: uniqueSiteUrls.map((url) => ({
    //       status: UrlIntegrationStatus.simulationPending,//TODO rename enum property
    //       url,
    //       setupId: setup.id
    //     }))
    //   });
    // }
    let status;
    switch (type) {
      case IntegrationProcessingType.READ_URLS:
        status = UrlIntegrationStatus.readingPending; //TODO rename enum property
        break;
      case IntegrationProcessingType.SIMULATION:
        status = UrlIntegrationStatus.simulationPending; //TODO rename enum property
        break;
    }

    await db.urlIntegration.createMany({
      data: uniqueSiteUrls.map((url) => ({
        status,
        url,
        setupId: setup.id
      }))
    });

    // const integrations = await db.itemIntegration.findMany({
    //   where: {
    //     url: {
    //       in: itemsUrls
    //     }
    //   }
    // });

    // const existingUrls = integrations.map((integrationItem) => integrationItem.url);

    // let sanitizedSiteUrls: string[];

    // if (existingUrls.length === 0) {
    //   sanitizedSiteUrls = [...itemsUrls];
    // } else {
    //   sanitizedSiteUrls = itemsUrls.filter((pageUrl) => !existingUrls.some((existingUrl) => pageUrl === existingUrl));
    // }

    // if (sanitizedSiteUrls.length === 0) {
    //   res.status(304).end();
    //   return;
    // }

    // const categories = await db.category.findMany();

    // const itemsToIntegrate: Partial<ItemIntegration & { hasCategory: boolean }>[] = [];

    // for await (const url of sanitizedSiteUrls) {
    //   const pageContent = await fetchPageAsString(url);
    //   const currentNode = pageNodes.find((node) => node.includes(url));
    //   const name = getTextFromNodeAsString(currentNode!, '*') || url;
    //   const categorySelectors = JSON.parse(setup.categorySelector) as IntegrationSelector[];

    //   let categoryName: string | null = null;

    //   categorySelectors.forEach((selector) => {
    //     if (!categoryName) {
    //       categoryName = parseCategory(pageContent, selector.value, JSON.parse(req.body.categoryBinding));
    //     }
    //   });

    //   itemsToIntegrate.push({
    //     name,
    //     url,
    //     status:
    //       type === IntegrationProcessingType.SIMULATION
    //         ? ItemIntegrationStatus.pendingSimulation
    //         : ItemIntegrationStatus.pending,
    //     setupId: setup.id,
    //     categoryId: categories.find((category) => category.name === categoryName)?.id || 1,
    //     hasCategory: !!categoryName
    //   });
    // }

    // for await (const item of itemsToIntegrate) {
    //   await db.itemIntegration.create({
    //     data: {
    //       name: item.name!,
    //       url: item.url!,
    //       status: item.status!,
    //       setupId: item.setupId!,
    //       categoryId: item.categoryId!,
    //       logs: {
    //         create: {
    //           key: ItemSimulationReference.hasCategory,
    //           reference: item.name!,
    //           value: String(item.hasCategory)
    //         }
    //       }
    //     }
    //   });
    // }
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

    // const itemsWithCategory = itemsToIntegrate.filter((item) => item.hasCategory);

    // await db.integrationLog.createMany({
    //   data: [
    //     {
    //       key: ItemSimulationReference.initialQuantity,
    //       reference: 'Global',
    //       value: itemsToIntegrate.length.toString()
    //     },
    //     {
    //       key: ItemSimulationReference.categoryPercentage,
    //       reference: 'Global',
    //       value: `${String((itemsWithCategory.length * 100) / itemsToIntegrate.length)}%`
    //     }
    //   ]
    // });

    res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
