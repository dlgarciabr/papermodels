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

const extractPageItems = async (
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

//TODO try to improve speed
const _saveItemIntegrations = async (
  pageItems: IPageItem[],
  setup: IntegrationSetup,
  type: IntegrationProcessingType
) => {
  const msg = `${pageItems.map((p) => `[UrlIntegrationJOB] Creating ItemIntegrations for ${p.name}...\n`)}`;
  console.log(msg);

  const status =
    type === IntegrationProcessingType.SIMULATION
      ? ItemIntegrationStatus.pendingSimulation
      : ItemIntegrationStatus.pending;

  await db.itemIntegration.createMany({
    data: pageItems.map((pageItem) => ({
      name: pageItem.name!,
      url: pageItem.url,
      status,
      setupId: setup.id,
      categoryId: categoriesCache.find((category) => category.name === pageItem.categoryName)?.id || 1
    }))
  });

  await db.integrationLog.createMany({
    data: pageItems.map((pageItem) => ({
      key: ItemSimulationReference.hasCategory,
      reference: pageItem.name!,
      value: String(!!pageItem.categoryName)
    }))
  });
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
        hasCategory: !!pageItem.categoryName
      }
    });
  } catch (error) {
    await db.integrationLog.create({
      data: {
        key: ItemSimulationReference.error,
        reference: pageItem.name!,
        value: (error as Error).message,
        error: (error as Error).stack
      }
    });
  }
};

const processIntegration = async () => {
  const systemParams = await db.systemParameter.findMany({
    where: {
      key: {
        in: [
          SystemParameterType.INTEGRATION_TYPE,
          SystemParameterType.INTEGRATION_QUANTITY,
          SystemParameterType.INTEGRATION_ITEM_NAME,
          SystemParameterType.INTEGRATION_REINTEGRATE_ITEM_ID
        ]
      }
    }
  });

  const selectedItemName = systemParams.find((param) => param.key === SystemParameterType.INTEGRATION_ITEM_NAME)?.value;
  const isItemNamedIntegration = !!selectedItemName;

  const processingQtyType = systemParams.find((param) => param.key === SystemParameterType.INTEGRATION_QUANTITY)
    ?.value as IntegrationProcessingQtyType;

  const reintegrationItemIdParam = systemParams.find(
    (param) => param.key === SystemParameterType.INTEGRATION_REINTEGRATE_ITEM_ID
  );
  const isItemReintegration = !!(reintegrationItemIdParam && Number(reintegrationItemIdParam.value));

  const typeParam = systemParams.find((param) => param.key === SystemParameterType.INTEGRATION_TYPE);
  const type = typeParam?.value as IntegrationProcessingType;

  const isReadUrl = type === IntegrationProcessingType.READ_URLS;
  const isSimulation = type === IntegrationProcessingType.SIMULATION;
  const isIntegration = type === IntegrationProcessingType.INTEGRATION;

  let urlIntegrationsToProcess: (UrlIntegration & { setup: IntegrationSetup })[] = [];

  if (isItemNamedIntegration) {
    let urlIntegrationStatus;

    if (isIntegration) {
      urlIntegrationStatus = UrlIntegrationStatus.pending;
    } else {
      urlIntegrationStatus = UrlIntegrationStatus.simulationPending;
    }

    urlIntegrationsToProcess = await db.urlIntegration.findMany({
      where: {
        status: urlIntegrationStatus
      },
      include: {
        setup: true
      }
    });
  } else if (isReadUrl || isSimulation) {
    urlIntegrationsToProcess = await db.urlIntegration.findMany({
      where: {
        status: {
          in: [UrlIntegrationStatus.readingPending, UrlIntegrationStatus.simulationPending]
        }
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
    urlIntegrationsToProcess = urlIntegrationsToProcess.slice(0, Math.ceil(urlIntegrationsToProcess.length / divisor));
  } else {
    urlIntegrationsToProcess = await db.urlIntegration.findMany({
      where: {
        status: UrlIntegrationStatus.pending
      },
      include: {
        setup: true
      },
      take: 10
    });
  }

  if (urlIntegrationsToProcess.length === 0) {
    console.log(`[UrlIntegrationJOB] Nothing to be done, quiting!`);
    return;
  }

  if (categoriesCache.length === 0) {
    categoriesCache = await db.category.findMany();
  }

  const setup = urlIntegrationsToProcess[0]!.setup;
  let pageItems: IPageItem[] = [];

  if (isItemReintegration) {
    const item = await db.item.findUnique({
      where: {
        id: Number(reintegrationItemIdParam.value)
      },
      include: {
        category: true
      }
    });
    pageItems.push({
      url: item?.integrationUrl!,
      categoryName: item?.category.name,
      name: item?.name
    });
  } else {
    for await (const urlIntegration of urlIntegrationsToProcess) {
      console.log(`[UrlIntegrationJOB] Reading URL ${urlIntegration.url} ...`);
      const itemUrlSelectors = JSON.parse(urlIntegration.setup.itemUrlSelector) as IntegrationSelector[];

      const isRunAllSelectors =
        urlIntegration.status === UrlIntegrationStatus.simulationPending ||
        urlIntegration.status === UrlIntegrationStatus.pending;

      let items: IPageItem[] = [];
      if (isRunAllSelectors) {
        if (categorySelectorsCache.length === 0) {
          categorySelectorsCache = JSON.parse(urlIntegration.setup.categorySelector) as IntegrationSelector[];
        }
        if (categoryBindingsCache.length === 0) {
          categoryBindingsCache = JSON.parse(urlIntegration.setup.categoryBinding) as IntegrationCategoryBinding[];
        }
        items = await extractPageItems(
          urlIntegration.url,
          itemUrlSelectors,
          categorySelectorsCache,
          categoryBindingsCache
        );
        items.forEach((item) => {
          if (item.url && item.url.indexOf(setup.key) < 0) {
            item.url = `${setup.domain}${item.url}`;
          }
        });
      } else {
        for await (const itemSelector of itemUrlSelectors) {
          items = (await readPageUrls(urlIntegration.url, itemSelector.value)).map((url) => {
            if (url && url.indexOf(setup.key) < 0) {
              return { url: `${setup.domain}${url}` as string };
            }
            return { url: url as string };
          });
        }
      }

      pageItems = [...pageItems, ...items];

      const isSelectedItemFound =
        selectedItemName &&
        items.filter((pageItem) => pageItem.name!.toLowerCase().indexOf(selectedItemName?.toLowerCase()) >= 0).length >
          0;
      if (isSelectedItemFound) {
        break;
      }
    }
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

    if (isSimulation || isIntegration) {
      await db.itemIntegration.deleteMany({
        where: {
          status: {
            in: [ItemIntegrationStatus.pendingSimulation, ItemIntegrationStatus.simulated]
          }
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
              status: {
                in: [ItemIntegrationStatus.running, ItemIntegrationStatus.done]
              }
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

      console.log(`[UrlIntegrationJOB] Creating ItemIntegrations...`);

      if (selectedItemName) {
        const pageItems = uniquePageItems.filter(
          (pageItem) => pageItem.name!.toLowerCase().indexOf(selectedItemName.toLowerCase()) >= 0
        );
        if (pageItems.length > 0) {
          console.log('[UrlIntegrationJOB] Named integration to be done found!');
          if (isItemReintegration) {
            await db.itemIntegration.deleteMany({
              where: {
                url: {
                  in: pageItems.map((pa) => pa.url)
                }
              }
            });
          }
          for await (const pageItem of pageItems) {
            await createItemIntegration(pageItem, setup, type);
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
        const pageItemsToCreate = uniquePageItems.filter((pageItem) => uniqueSiteUrls.indexOf(pageItem.url) > 0);

        if (processingQtyType === IntegrationProcessingQtyType.ONE) {
          await createItemIntegration(pageItemsToCreate[0]!, setup, type);
        } else {
          for await (const pageItem of pageItemsToCreate) {
            await createItemIntegration(pageItem, setup, type);
          }
        }
      }
    }
  }

  let nextStatus;

  switch (urlIntegrationsToProcess[0]?.status) {
    case UrlIntegrationStatus.readingPending:
      nextStatus = UrlIntegrationStatus.readingDone;
      break;
    case UrlIntegrationStatus.simulationPending:
      nextStatus = UrlIntegrationStatus.simulationDone;
      break;
    case UrlIntegrationStatus.pending:
      nextStatus = UrlIntegrationStatus.done;
      break;
  }

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
        status: {
          in: [UrlIntegrationStatus.readingDone, UrlIntegrationStatus.simulationDone]
        }
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
