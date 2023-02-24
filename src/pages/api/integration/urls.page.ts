/* istanbul ignore file -- @preserve */
import db, { Category, IntegrationSetup, ItemIntegrationStatus, UrlIntegrationStatus } from 'db';
import _ from 'lodash';
import { api } from 'src/blitz-server';
import { IntegrationProcessingType, IntegrationSelector, ItemSimulationReference } from 'types';
import { IPageItem } from './types';

import { fetchPageAsString, executeSelectorAllOnHtmlText, readPageUrls } from './util';

let categorySelectorsCache: IntegrationSelector[] = [];
let categoriesCache: Category[] = [];

// const parseCategory = (pageContent: string, categorySelector: string, categoryBinding: any[]): string | null => {
//   try {
//     const pageCategory = getTextFromNodeAsString(pageContent, categorySelector);
//     return categoryBinding.find((cat) => cat.pageCategoryName.toLowerCase() === pageCategory?.toLowerCase())
//       .systemCategoryName;
//   } catch (error) {
//     return null;
//   }
// };

const searchPageItemCategory = (
  itemNode: Element,
  selectors: IntegrationSelector[],
  level: number = 0
): string | null => {
  let categoryName: string | null = null;
  try {
    selectors.forEach((selector) => {
      if (categoryName) {
        return;
      }
      const node = itemNode.parentElement!.querySelector(selector.value);
      if (node) {
        categoryName = node.textContent;
      } else {
        if (level <= 5) {
          categoryName = searchPageItemCategory(itemNode.parentElement!.parentElement!, selectors, level++);
        }
      }
    });
  } catch (error) {
    // handle error
  }
  return categoryName;
};

const extractPageItem = async (
  pageUrl: string,
  itemSelectors: IntegrationSelector[],
  categorySelectors: IntegrationSelector[]
): Promise<IPageItem[]> => {
  let pageItems: IPageItem[] = [];
  const pageContent = await fetchPageAsString(pageUrl);
  for await (const itemSelector of itemSelectors) {
    const itemNodes = executeSelectorAllOnHtmlText(pageContent, itemSelector.value);
    pageItems = pageItems.concat(
      Array.from(itemNodes).map((itemNode) => {
        const name = itemNode.textContent;
        const url = itemNode.getAttribute('href') || '';
        return {
          name: name || url,
          categoryName: searchPageItemCategory(itemNode, categorySelectors) as string,
          url
        };
      })
    );
  }
  return pageItems;
};

const createItemIntegration = async (pageItem: IPageItem, setup: IntegrationSetup, type: IntegrationProcessingType) => {
  console.log(`[UrlIntegrationJOB] Creating ItemIntegration for ${pageItem.name} ...`);
  const categoryBindingObject = JSON.parse(setup.categoryBinding) as any[];

  let categoryName: string | null = categoryBindingObject.find(
    (cat) => cat.pageCategoryName.toLowerCase() === pageItem.categoryName?.toLowerCase()
  )?.systemCategoryName;

  const status =
    type === IntegrationProcessingType.SIMULATION
      ? ItemIntegrationStatus.pendingSimulation
      : ItemIntegrationStatus.pending;

  await db.itemIntegration.create({
    data: {
      name: pageItem.name!,
      url: pageItem.url,
      status,
      setupId: setup.id,
      categoryId: categoriesCache.find((category) => category.name === categoryName)?.id || 1,
      logs: {
        create: {
          key: ItemSimulationReference.hasCategory,
          reference: pageItem.name!,
          value: String(!!categoryName)
        }
      }
    }
  });
};

const processIntegration = async () => {
  const partialTypeParam = await db.systemParameter.findFirst({
    where: {
      key: 'IntegrationProcessingPartialType'
    }
  });

  const isPartial = eval(partialTypeParam!.value);

  const urlIntegrationsToProcess = await db.urlIntegration.findMany({
    where: {
      OR: [{ status: UrlIntegrationStatus.readingPending }, { status: UrlIntegrationStatus.simulationPending }]
    },
    include: {
      setup: true
    },
    take: 10
  });

  if (urlIntegrationsToProcess.length === 0) {
    return;
  }

  if (categoriesCache.length === 0) {
    categoriesCache = await db.category.findMany();
  }

  const setup = urlIntegrationsToProcess[0]!.setup;
  let pageItems: IPageItem[] = [];

  for await (const urlIntegration of urlIntegrationsToProcess) {
    console.log(`[UrlIntegrationJOB] Reading URL ${urlIntegration.url} ...`);
    const itemUrlSelectors = JSON.parse(urlIntegration.setup.itemUrlSelector) as IntegrationSelector[];

    let items: IPageItem[] = [];
    if (urlIntegration.status === UrlIntegrationStatus.readingPending) {
      for await (const itemSelector of itemUrlSelectors) {
        items = (await readPageUrls(urlIntegration.url, itemSelector.value)).map((url) => ({ url: url as string }));
      }
    } else if (urlIntegration.status === UrlIntegrationStatus.simulationPending) {
      if (categorySelectorsCache.length === 0) {
        categorySelectorsCache = JSON.parse(urlIntegration.setup.categorySelector) as IntegrationSelector[];
      }
      items = await extractPageItem(urlIntegration.url, itemUrlSelectors, categorySelectorsCache);
    }

    pageItems = [...pageItems, ...items];
  }

  const uniquePageItems = _.uniqWith(pageItems, _.isEqual) as IPageItem[];

  console.log(`[UrlIntegrationJOB] Found ${uniquePageItems.length} item(s).`);

  if (uniquePageItems.length > 0) {
    await db.integrationLog.createMany({
      data: uniquePageItems.map((pageItem) => ({
        key: ItemSimulationReference.url,
        reference: 'Global',
        value: pageItem.url
      }))
    });

    if (urlIntegrationsToProcess[0]!.status === UrlIntegrationStatus.simulationPending) {
      console.log(`[UrlIntegrationJOB] Creating ItemIntegrations...`);
      await db.itemIntegration.deleteMany({
        where: {
          OR: [{ status: ItemIntegrationStatus.pendingSimulation }, { status: ItemIntegrationStatus.simulated }]
        }
      });
      const uniquePageItemUrls = uniquePageItems.map((pageItem) => pageItem.url);

      const integrations = await db.itemIntegration.findMany({
        where: {
          AND: [
            {
              url: {
                in: uniquePageItemUrls
              }
            },
            {
              OR: [{ status: ItemIntegrationStatus.running }, { status: ItemIntegrationStatus.done }]
            }
          ]
        }
      });

      const existingUrls = integrations.map((integrationItem) => integrationItem.url);

      let uniqueSiteUrls: string[] = [...uniquePageItemUrls];

      if (existingUrls.length > 0) {
        uniqueSiteUrls = uniquePageItemUrls.filter(
          (pageUrl) => !existingUrls.some((existingUrl) => pageUrl === existingUrl)
        );
      }

      for await (const pageItem of uniquePageItems.filter((pageItem) => uniqueSiteUrls.indexOf(pageItem.url) > 0)) {
        await createItemIntegration(pageItem, setup, IntegrationProcessingType.SIMULATION);
      }
    }
  }

  const nextStatus =
    urlIntegrationsToProcess[0]?.status === UrlIntegrationStatus.readingPending
      ? UrlIntegrationStatus.readingDone
      : UrlIntegrationStatus.simulationDone;

  console.log(`[UrlIntegrationJOB] Updating UrlIntegrations status to ${nextStatus}...`);

  await db.urlIntegration.updateMany({
    where: {
      id: {
        in: urlIntegrationsToProcess.map((integration) => integration.id)
      }
    },
    data: {
      status: nextStatus
    }
  });

  if (!isPartial) {
    await processIntegration();
  }
};

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    console.log(`
===================================================================================
|                     Initializing Site URLs processing job...                     |
===================================================================================
    `);
    await processIntegration();

    console.log(`[UrlIntegrationJOB] Cleaning duplicated registries...`);

    const urlIntegrationUrls = (
      await db.integrationLog.findMany({
        where: {
          key: ItemSimulationReference.url
        }
      })
    ).map((integrationLog) => integrationLog.value);

    const uniqueItemUrls = Array.from(new Set(urlIntegrationUrls));

    // await db.$transaction(async (tx: typeof db) => {
    // });

    await db.integrationLog.deleteMany({
      where: {
        key: ItemSimulationReference.url
      }
    });

    const integrationStatus = await db.urlIntegration.findFirst({
      where: {
        OR: [{ status: UrlIntegrationStatus.readingDone }, { status: UrlIntegrationStatus.simulationDone }]
      },
      select: {
        status: true
      }
    });

    if (integrationStatus?.status === UrlIntegrationStatus.readingDone) {
      console.log(`[UrlIntegrationJOB] Saving final logs...`);

      const createReturn = await db.integrationLog.createMany({
        data: uniqueItemUrls.map((url) => ({
          key: ItemSimulationReference.url,
          reference: 'Global',
          value: url
        }))
      });

      await db.integrationLog.createMany({
        data: [
          {
            key: ItemSimulationReference.initialQuantity,
            reference: 'Global',
            value: createReturn.count.toString()
          }
        ]
      });
    } else if (integrationStatus?.status === UrlIntegrationStatus.simulationDone) {
      // const integrations = await db.itemIntegration.findMany({
      //   where: {
      //     AND: [
      //       {
      //         url: {
      //           in: uniqueItemUrls
      //         }
      //       },
      //       {
      //         OR: [{ status: ItemIntegrationStatus.running }, { status: ItemIntegrationStatus.done }]
      //       }
      //     ]
      //   }
      // });
      // const existingUrls = integrations.map((integrationItem) => integrationItem.url);
      // let sanitizedSiteUrls: string[];
      // if (existingUrls.length === 0) {
      //   sanitizedSiteUrls = [...uniqueItemUrls];
      // } else

      //   sanitizedSiteUrls = uniqueItemUrls.filter((pageUrl) => !existingUrls.some((existingUrl) => pageUrl === existingUrl));
      // }
      // const categories = await db.category.findMany();
      // const itemsToIntegrate: Partial<ItemIntegration & { hasCategory: boolean }>[] = [];
      // let pageNodes: string[] = [];
      // itemUrlSelectors.forEach((selector) => {
      //   const nodes = readPageNodesAsString(pageContent, selector.value);
      //   pageNodes = [...pageNodes, ...nodes];
      // });
      // await db.$transaction(async (tx) => {
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
      // })

      console.log(`[UrlIntegrationJOB] Saving final logs...`);

      const itemIntegrationsCreated = await db.itemIntegration.findMany({
        where: {
          status: ItemIntegrationStatus.pendingSimulation
        }
      });

      const itemsWithCategory = itemIntegrationsCreated.filter((item) => item.categoryId !== 1);

      await db.integrationLog.createMany({
        data: [
          {
            key: ItemSimulationReference.initialQuantity,
            reference: 'Global',
            value: itemIntegrationsCreated.length.toString()
          },
          {
            key: ItemSimulationReference.categoryPercentage,
            reference: 'Global',
            value: `${String(Math.round((itemsWithCategory.length * 100) / itemIntegrationsCreated.length))}%`
          }
        ]
      });
    }

    console.log(`[UrlIntegrationJOB] Site URLs processing job finished`);
    res.status(200).end();

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
