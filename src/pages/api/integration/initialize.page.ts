/* istanbul ignore file -- @preserve */
import db, { IntegrationSetup, UrlIntegrationStatus } from 'db';
import { api } from 'src/blitz-server';
import { IntegrationProcessingType, ItemSimulationReference, SystemParameterType } from 'types';
import { getAllSiteUrls } from './util';

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const setup = req.body as IntegrationSetup;
    const type = req.body.type as IntegrationProcessingType;
    const processingQtyType = req.body.processingQtyType;
    const itemName = req.body.itemName;

    if (!setup) {
      res.status(500).send({ message: 'IntegrationSetup not defined' });
      return;
    }

    if (!type) {
      res.status(500).send({ message: 'IntegrationProcessingType not defined' });
      return;
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

    console.log(`[IntegrationInitializer] Extracting all site URLs...`);
    const uniqueSiteUrls = await getAllSiteUrls(setup.domain, setup.key);

    console.log(`[IntegrationInitializer] Cleaning old registries...`);
    await db.$queryRaw`TRUNCATE TABLE \"public\".\"IntegrationLog\";`;
    await db.$queryRaw`TRUNCATE TABLE \"public\".\"ItemIntegration\";`;
    await db.$queryRaw`TRUNCATE TABLE \"public\".\"UrlIntegration\";`;

    let status;
    switch (type) {
      case IntegrationProcessingType.READ_URLS:
        status = UrlIntegrationStatus.readingPending; //TODO rename enum property
        break;
      case IntegrationProcessingType.SIMULATION:
        status = UrlIntegrationStatus.simulationPending; //TODO rename enum property
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

    await db.integrationLog.create({
      data: {
        key: ItemSimulationReference.percentage,
        reference: 'Global',
        value: '0'
      }
    });

    console.log(`[IntegrationInitializer] Integration initialized!`);

    res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
