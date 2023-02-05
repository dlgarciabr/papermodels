/* istanbul ignore file -- @preserve */
import { Decimal } from '@prisma/client/runtime';
import db, { IntegrationItemStatus } from 'db';
import { api } from 'src/blitz-server';

const processIntegration = async () => {
  const integrationList = await db.integrationItem.findMany({
    where: {
      status: IntegrationItemStatus.pending
    }
  });

  if (integrationList.length > 0) {
    console.log(`[IntegrationJOB] ${integrationList.length} item(s) to be integrated found!`);
    console.log(`[IntegrationJOB] ${new Date().toISOString()} - Item integration process started.`);

    for await (const integrationItem of integrationList) {
      try {
        console.log(`[IntegrationJOB] Integrating item '${integrationItem.reference}'`);
        await db.integrationItem.update({
          where: { id: integrationItem.id },
          data: {
            status: IntegrationItemStatus.running
          }
        });

        await db.item.create({
          data: {
            name: 'item',
            description: 'item desc',
            dificulty: 1,
            assemblyTime: new Decimal(1),
            categoryId: 1
          }
        });

        await db.integrationItem.update({
          where: { id: integrationItem.id },
          data: {
            status: IntegrationItemStatus.done
          }
        });
      } catch (error) {
        console.error(error);
        await db.integrationItem.update({
          where: { id: integrationItem.id },
          data: {
            error,
            status: IntegrationItemStatus.error
          }
        });
      }
    }

    // for await (const integrationItem of integrationList) {

    // const processedList = await processFiles(integrationItem.integrationList);
    // console.log('processedList', processedList)
    // await uploadFiles(processedList);
    // await saveItemFiles(processedList);
    // }

    console.log(`[IntegrationJOB] ${new Date().toISOString()} Item integration process finished.`);
  } else {
    console.log(`[IntegrationJOB] No items to be integrated!`);
  }
};

export default api(async (_req, res, _ctx) => {
  console.log(`
===================================================================================
|                        Starting Item integration job...                         |
===================================================================================
`);

  await processIntegration();
  // await db.$queryRaw`SELECT 1`;
  res.status(200).send({});
});
