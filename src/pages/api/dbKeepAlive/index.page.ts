/* istanbul ignore file -- @preserve */
import db from 'db';
import { api } from 'src/blitz-server';
import { testCallServerlessFunc } from 'src/pages/items/utils';

const processIntegration = async () => {
  console.log(`Integration process started at ${new Date().toLocaleDateString()}`);

  // const integrationList = await db.integrationItem.findMany({
  //   where: {
  //     status: IntegrationItemStatus.todo
  //   },
  // });

  // for await (const integrationItem of integrationList) {
  //   try {
  //     await db.integrationItem.update({
  //       where: { id: integrationItem.id },
  //       data: {
  //         status: IntegrationItemStatus.running
  //       }
  //     });

  //     await db.item.create({
  //       data: {

  //       }
  //     });

  //     await db.integrationItem.update({
  //       where: { id: integrationItem.id },
  //       data: {
  //         status: IntegrationItemStatus.done
  //       }
  //     });
  //   } catch (error) {
  //     await db.integrationItem.update({
  //       where: { id: integrationItem.id },
  //       data: {
  //         error,
  //         status: IntegrationItemStatus.error
  //       }
  //     });
  //   }
  // }

  // for await (const integrationItem of integrationList) {

  // const processedList = await processFiles(integrationItem.integrationList);
  // console.log('processedList', processedList)
  // await uploadFiles(processedList);
  // await saveItemFiles(processedList);
  // }

  console.log(`Integration process ended at ${new Date().toLocaleDateString()}`);
};

export default api(async (_req, res, _ctx) => {
  await processIntegration();
  testCallServerlessFunc();
  await db.$queryRaw`SELECT 1`;
  console.log('db alive!');
  res.status(200).send({});
});
