/* istanbul ignore file -- @preserve */
// import db, { IntegrationItemStatus } from 'db';
import { api } from 'src/blitz-server';
// import { JSDOM } from 'jsdom';

// const readPageItemList = async () => {
//   const url = 'https://papermau.blogspot.com/';
//   const querySelector = 'div>b>a';
//   const param = 'href';

//   const pageResponse = await fetch(url);
//   const pageContent = await pageResponse.text();
//   const document = new JSDOM(pageContent);
//   const selection = document.window.document.querySelectorAll(querySelector);
//   await db.integrationItem.createMany({
//     data: Array.from(selection).map((node: any) => ({
//       reference: node[param],
//       status: IntegrationItemStatus.feeding
//     }))
//   });
// }

export default api(async (_req, res, _ctx) => {
  console.log(`
===================================================================================
|                        Collecting items for integration                         |
===================================================================================
`);

  // await processIntegration();
  // await db.$queryRaw`SELECT 1`;
  res.status(200).send({});
});
