/* istanbul ignore file -- @preserve */
import db, { IntegrationSetup, UrlIntegrationStatus } from 'db';
import { api } from 'src/blitz-server';
import { v2 as cloudinary } from 'cloudinary';
import { IntegrationProcessingType, ItemSimulationReference, SystemParameterType } from 'types';
import { getAllSiteUrls } from './util';

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const setup = req.body as IntegrationSetup;
    const type = req.body.type as IntegrationProcessingType;
    const processingQtyType = req.body.processingQtyType;
    const itemName = req.body.itemName;
    const replaceItems = req.body.replaceItems;

    if (!setup) {
      res.status(500).send({ message: 'IntegrationSetup not defined' });
      return;
    }

    if (!type) {
      res.status(500).send({ message: 'IntegrationProcessingType not defined' });
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      const ARTIFACTS_PATH = 'papermodel_test'; //assure that this logic runs only in test CDN

      try {
        console.log('[IntegrationInitializer] Cleaning Cloudinary old test files...');
        await cloudinary.api.delete_resources_by_prefix(ARTIFACTS_PATH);

        console.log('[IntegrationInitializer] Cleaning Cloudinary old test folders...');
        await cloudinary.api.delete_folder(ARTIFACTS_PATH);
      } catch (error) {
        console.log(`[IntegrationInitializer] Error: ${error.message}!`);
      }
    }

    console.log(`[IntegrationInitializer] Creating support registries...`);
    await db.systemParameter.upsert({
      where: {
        key: SystemParameterType.INTEGRATION_QUANTITY
      },
      update: {
        value: processingQtyType
      },
      create: {
        key: SystemParameterType.INTEGRATION_QUANTITY,
        value: processingQtyType
      }
    });
    await db.systemParameter.upsert({
      where: {
        key: SystemParameterType.INTEGRATION_START_TIME
      },
      update: {
        value: String(new Date().getTime())
      },
      create: {
        key: SystemParameterType.INTEGRATION_START_TIME,
        value: String(new Date().getTime())
      }
    });
    await db.systemParameter.upsert({
      where: {
        key: SystemParameterType.INTEGRATION_TYPE
      },
      update: {
        value: String(type)
      },
      create: {
        key: SystemParameterType.INTEGRATION_TYPE,
        value: String(type)
      }
    });
    if (replaceItems) {
      const items = await db.item.findMany({
        where: {
          integrationUrl: {
            startsWith: setup.domain
          }
        }
      });

      process.stdout.write('\n[IntegrationInitializer] Cleaning Cloudinary old assets...');
      for await (const item of items) {
        try {
          const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';
          await cloudinary.api.delete_resources_by_prefix(`${ARTIFACTS_PATH}/${item.id}`);
          await cloudinary.api.delete_folder(`${ARTIFACTS_PATH}/${item.id}`);
        } catch (error) {
          //do nothing
        }
        process.stdout.write('.');
      }
      process.stdout.write('done\n');

      await db.item.deleteMany({
        where: {
          integrationUrl: {
            startsWith: setup.domain
          }
        }
      });
    }

    if (itemName) {
      await db.systemParameter.upsert({
        where: {
          key: SystemParameterType.INTEGRATION_ITEM_NAME
        },
        update: {
          value: itemName
        },
        create: {
          key: SystemParameterType.INTEGRATION_ITEM_NAME,
          value: itemName
        }
      });

      const systemParameters = await db.systemParameter.findMany({
        where: {
          key: SystemParameterType.INTEGRATION_REINTEGRATE_ITEM_ID
        }
      });

      const itemReintegrationParam = systemParameters.find(
        (param) => param.key === SystemParameterType.INTEGRATION_REINTEGRATE_ITEM_ID
      );
      const isItemReintegration = !!(itemReintegrationParam && Number(itemReintegrationParam.value));

      if (isItemReintegration) {
        try {
          const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';
          console.log('[IntegrationInitializer] Cleaning Cloudinary old assets...');
          await cloudinary.api.delete_resources_by_prefix(`${ARTIFACTS_PATH}/${itemReintegrationParam.value}`);
          await cloudinary.api.delete_folder(`${ARTIFACTS_PATH}/${itemReintegrationParam.value}`);
        } catch (error) {
          //do nothing
        }
      }
    }

    console.log(`[IntegrationInitializer] Extracting all site URLs...`);
    const uniqueSiteUrls = await getAllSiteUrls(setup.domain, setup.key);

    console.log(`[IntegrationInitializer] Cleaning old registries...`);
    await db.$queryRaw`TRUNCATE TABLE \"public\".\"IntegrationLog\";`;
    await db.$queryRaw`TRUNCATE TABLE \"public\".\"ItemIntegration\" CASCADE;`;
    await db.$queryRaw`TRUNCATE TABLE \"public\".\"UrlIntegration\";`;

    let status;
    switch (type) {
      case IntegrationProcessingType.READ_URLS:
        status = UrlIntegrationStatus.readingPending;
        break;
      case IntegrationProcessingType.SIMULATION:
        status = UrlIntegrationStatus.simulationPending;
        break;
      case IntegrationProcessingType.INTEGRATION:
        status = UrlIntegrationStatus.pending;
        break;
    }

    console.log(`[IntegrationInitializer] Saving extracted site URLs...`);

    await db.urlIntegration.createMany({
      data: uniqueSiteUrls.map((url) => ({
        status,
        url,
        setupId: setup.id
      }))
    });

    if (type !== IntegrationProcessingType.READ_URLS) {
      await db.integrationLog.create({
        data: {
          key: ItemSimulationReference.percentage,
          reference: 'Global',
          value: '0%'
        }
      });
    }

    console.log(`[IntegrationInitializer] Integration initialized!`);

    res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
