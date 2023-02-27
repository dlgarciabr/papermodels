/* istanbul ignore file -- @preserve */
import db, { IntegrationSetup, ItemIntegrationStatus, UrlIntegrationStatus } from 'db';
import { api } from 'src/blitz-server';
import { IntegrationProcessingType, SystemParameterType } from 'types';
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

    await db.systemParameter.deleteMany({
      where: {
        OR: [
          { key: 'IntegrationProcessingType' },
          { key: 'IntegrationProcessingQtyType' },
          { key: 'IntegrationProcessingStartTime' },
          { key: SystemParameterType.INTEGRATION_ITEM_NAME }
        ]
      }
    });

    await db.systemParameter.createMany({
      data: [
        {
          key: 'IntegrationProcessingType',
          value: String(type)
        },
        {
          key: 'IntegrationProcessingQtyType',
          value: processingQtyType
        },
        {
          key: 'IntegrationProcessingStartTime',
          value: String(new Date().getTime())
        },
        {
          key: SystemParameterType.INTEGRATION_ITEM_NAME,
          value: itemName
        }
      ]
    });

    const uniqueSiteUrls = await getAllSiteUrls(setup.domain, setup.key);

    await db.integrationLog.deleteMany({
      where: {
        integrationId: null
      }
    });

    await db.itemIntegration.deleteMany({
      where: {
        OR: [
          { status: ItemIntegrationStatus.pendingSimulation },
          { status: ItemIntegrationStatus.runningSimulation },
          { status: ItemIntegrationStatus.simulated },
          { status: ItemIntegrationStatus.error }
        ]
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

    res.status(200).send({ message: 'success' });
  } else {
    res.status(501).send({});
  }
});
