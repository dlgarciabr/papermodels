/* istanbul ignore file -- @preserve */
import db, { Category, IntegrationSetup, ItemIntegrationStatus, UrlIntegration, UrlIntegrationStatus } from 'db';
import _ from 'lodash';
import { api } from 'src/blitz-server';
import {
  IntegrationCategoryBinding,
  IntegrationProcessingQtyType,
  IntegrationProcessingType,
  IntegrationSelector,
  ItemSimulationReference,
  SystemParameterType
} from 'types';
import { IPageItem } from './types';

import { fetchPageAsString, executeSelectorAllOnHtmlText, readPageUrls } from './util';

let categorySelectorsCache: IntegrationSelector[] = [];
let categoryBindingsCache: IntegrationCategoryBinding[] = [];
let categoriesCache: Category[] = [];

const searchPageItemCategory = (
  itemNode: Element,
  categorySelectors: IntegrationSelector[],
  categoryBindings: IntegrationCategoryBinding[],
  level: number = 0
): string | null => {
  let categoryName: string | undefined | null = null;
  try {
    categorySelectors.forEach((selector) => {
      if (categoryName) {
        return;
      }
      const node = itemNode.parentElement!.querySelector(selector.value);
      if (node) {
        categoryName = categoriesCache.find(
          (cat) => cat.name.toLowerCase().trim() === node.textContent?.toLowerCase().trim()
        )?.name;

        if (!categoryName) {
          categoryName = categoryBindings.find(
            (cat) => cat.pageCategoryName.toLowerCase().trim() === node.textContent?.toLowerCase().trim()
          )?.systemCategoryName;
        }
      } else {
        if (level <= 5) {
          categoryName = searchPageItemCategory(
            itemNode.parentElement!.parentElement!,
            categorySelectors,
            categoryBindings,
            level++
          );
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
  categorySelectors: IntegrationSelector[],
  categoryBindings: IntegrationCategoryBinding[]
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
          categoryName: searchPageItemCategory(itemNode, categorySelectors, categoryBindings) as string,
          url
        };
      })
    );
  }
  return pageItems;
};

const createItemIntegration = async (pageItem: IPageItem, setup: IntegrationSetup, type: IntegrationProcessingType) => {
  console.log(`[UrlIntegrationJOB] Creating ItemIntegration for ${pageItem.name} ...`);
  try {
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
        categoryId: categoriesCache.find((category) => category.name === pageItem.categoryName)?.id || 1,
        logs: {
          create: {
            key: ItemSimulationReference.hasCategory,
            reference: pageItem.name!,
            value: String(!!pageItem.categoryName)
          }
        }
      }
    });
  } catch (error) {
    await db.integrationLog.create({
      data: {
        key: ItemSimulationReference.error,
        reference: pageItem.name!,
        value: (error as Error).message
      }
    });
  }
};

const processIntegration = async () => {
  const systemParams = await db.systemParameter.findMany({
    where: {
      OR: [
        { key: 'IntegrationProcessingType' },
        { key: 'IntegrationProcessingQtyType' },
        { key: SystemParameterType.INTEGRATION_ITEM_NAME }
      ]
    }
  });

  const selectedItemName = systemParams.find((param) => param.key === SystemParameterType.INTEGRATION_ITEM_NAME)?.value;
  const typeParam = systemParams.find((param) => param.key === 'IntegrationProcessingType');
  const processingQtyType = systemParams.find((param) => param.key === 'IntegrationProcessingQtyType')
    ?.value as IntegrationProcessingQtyType;

  const type = typeParam?.value as IntegrationProcessingType;
  const isReadUrl = type === IntegrationProcessingType.READ_URLS;
  const isSimulation = type === IntegrationProcessingType.SIMULATION;
  const isIntegration = type === IntegrationProcessingType.INTEGRATION;
  // const isFew = processingQtyType === IntegrationProcessingQtyType.FEW;
  // const isIntermediate = processingQtyType === IntegrationProcessingQtyType.INTERMEDIATE;
  // const isFull = processingQtyType === IntegrationProcessingQtyType.FULL;

  let urlIntegrationsToProcess: (UrlIntegration & { setup: IntegrationSetup })[] = [];

  // if (isFew || isIntermediate) {
  //   urlIntegrationsToProcess = await db.urlIntegration.findMany({
  //     where: {
  //       OR: [{ status: UrlIntegrationStatus.readingPending }, { status: UrlIntegrationStatus.simulationPending }]
  //     },
  //     include: {
  //       setup: true
  //     },
  //     orderBy: {
  //       url: 'asc'
  //     }
  //   });
  //   const divisor = isFew ? 40 : 20;
  //   urlIntegrationsToProcess = urlIntegrationsToProcess.slice(0, Math.floor(urlIntegrationsToProcess.length / divisor));
  // } else {
  //   urlIntegrationsToProcess = await db.urlIntegration.findMany({
  //     where: {
  //       OR: [{ status: UrlIntegrationStatus.readingPending }, { status: UrlIntegrationStatus.simulationPending }]
  //     },
  //     include: {
  //       setup: true
  //     },
  //     take: 10
  //   });
  // }

  if (isReadUrl || isSimulation) {
    urlIntegrationsToProcess = await db.urlIntegration.findMany({
      where: {
        OR: [{ status: UrlIntegrationStatus.readingPending }, { status: UrlIntegrationStatus.simulationPending }]
      },
      include: {
        setup: true
      },
      orderBy: {
        url: 'asc'
      }
    });
    let divisor = 0;
    switch (processingQtyType) {
      case IntegrationProcessingQtyType.FEW:
        divisor = 40;
        break;
      case IntegrationProcessingQtyType.INTERMEDIATE:
        divisor = 20;
        break;
      case IntegrationProcessingQtyType.FULL:
        divisor = 1;
        break;
    }
    // const divisor = isFew ? 40 : 20;
    urlIntegrationsToProcess = urlIntegrationsToProcess.slice(0, Math.floor(urlIntegrationsToProcess.length / divisor));
  }

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
      if (categoryBindingsCache.length === 0) {
        categoryBindingsCache = JSON.parse(urlIntegration.setup.categoryBinding) as IntegrationCategoryBinding[];
      }
      items = await extractPageItem(
        urlIntegration.url,
        itemUrlSelectors,
        categorySelectorsCache,
        categoryBindingsCache
      );
    }

    pageItems = [...pageItems, ...items];
  }

  const uniquePageItems = _.uniqWith(pageItems, _.isEqual) as IPageItem[];

  console.log(`[UrlIntegrationJOB] Found ${uniquePageItems.length} item(s).`);

  if (uniquePageItems.length > 0) {
    if (type === IntegrationProcessingType.READ_URLS) {
      await db.integrationLog.createMany({
        data: uniquePageItems.map((pageItem) => ({
          key: ItemSimulationReference.url,
          reference: 'Global',
          value: pageItem.url
        }))
      });
    }

    // if (urlIntegrationsToProcess[0]!.status === UrlIntegrationStatus.simulationPending) {//????????
    if (isSimulation) {
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

      if (selectedItemName) {
        const pageItems = uniquePageItems.filter(
          (pageItem) => pageItem.name!.toLowerCase().indexOf(selectedItemName.toLowerCase()) >= 0
        );
        if (pageItems.length > 0) {
          for await (const pageItem of pageItems) {
            await createItemIntegration(pageItem, setup, IntegrationProcessingType.SIMULATION);
          }
        } else {
          await db.integrationLog.create({
            data: {
              key: ItemSimulationReference.url,
              reference: 'Global',
              value: `Selected Name Item ${selectedItemName} not found!`
            }
          });
        }
      } else {
        for await (const pageItem of uniquePageItems.filter((pageItem) => uniqueSiteUrls.indexOf(pageItem.url) > 0)) {
          await createItemIntegration(pageItem, setup, IntegrationProcessingType.SIMULATION);
        }
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

  if (isIntegration) {
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

    const integrationUrls = (
      await db.integrationLog.findMany({
        where: {
          key: ItemSimulationReference.url
        }
      })
    ).map((integrationLog) => integrationLog.value);

    const uniqueItemUrls = Array.from(new Set(integrationUrls));

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

    res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
