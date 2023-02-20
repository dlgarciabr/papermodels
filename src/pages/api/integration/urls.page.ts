/* istanbul ignore file -- @preserve */
import db, { UrlIntegrationStatus } from 'db';
import { api } from 'src/blitz-server';
import { IntegrationSelector, ItemSimulationReference } from 'types';

import { getItemUrlsFromPage } from './util';

// const parseCategory = (pageContent: string, categorySelector: string, categoryBinding: any[]): string | null => {
//   try {
//     const pageCategory = getTextFromNodeAsString(pageContent, categorySelector);
//     return categoryBinding.find((cat) => cat.pageCategoryName.toLowerCase() === pageCategory?.toLowerCase())
//       .systemCategoryName;
//   } catch (error) {
//     return null;
//   }
// };

const processIntegration = async () => {
  const urlIntegrationsToProcess = await db.urlIntegration.findMany({
    where: {
      status: UrlIntegrationStatus.readingPending
    },
    include: {
      setup: true
    },
    take: 10
  });

  if (urlIntegrationsToProcess.length === 0) {
    return;
  }

  let itemsUrls: any[] = [];

  for await (const urlIntegration of urlIntegrationsToProcess) {
    console.log(`[UrlIntegrationJOB] Reading URL ${urlIntegration.url}...`);
    const itemUrlSelectors = JSON.parse(urlIntegration.setup.itemUrlSelector) as IntegrationSelector[];
    const urls = await getItemUrlsFromPage(urlIntegration.url, itemUrlSelectors);
    itemsUrls = [...itemsUrls, ...urls];
  }

  itemsUrls = Array.from(new Set(itemsUrls));

  console.log(`[UrlIntegrationJOB] Found ${itemsUrls.length} item(s).`);

  if (itemsUrls.length > 0) {
    await db.integrationLog.createMany({
      data: itemsUrls.map((url) => ({
        key: ItemSimulationReference.url,
        reference: 'Global',
        value: url
      }))
    });
  }

  console.log(`[UrlIntegrationJOB] Updating urls to readingDone...`);
  console.log(
    '',
    urlIntegrationsToProcess.map((integration) => integration.id)
  );

  await db.urlIntegration.updateMany({
    where: {
      id: {
        in: urlIntegrationsToProcess.map((integration) => integration.id)
      }
    },
    data: {
      status: UrlIntegrationStatus.readingDone
    }
  });

  await processIntegration();
};

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    console.log(`
===================================================================================
|                     Initializing Site URLs processing job...                     |
===================================================================================
    `);
    await processIntegration();

    const qty = await db.integrationLog.count({
      where: {
        key: ItemSimulationReference.url
      }
    });
    await db.integrationLog.createMany({
      data: [
        {
          key: ItemSimulationReference.initialQuantity,
          reference: 'Global',
          value: qty.toString()
        }
      ]
    });
    console.log(`[UrlIntegrationJOB] Site URLs processing job finished`);
    res.status(200).end();

    // await db.itemIntegration.deleteMany({
    //   where: {
    //     OR: [{ status: ItemIntegrationStatus.pendingSimulation }, { status: ItemIntegrationStatus.simulated }]
    //   }
    // });

    // await db.integrationLog.deleteMany({
    //   where: {
    //     integrationId: null
    //   }
    // });

    // if (type === IntegrationProcessingType.READ_URLS) {

    // res.status(200).end();
    // return;
    // }

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

    // res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
