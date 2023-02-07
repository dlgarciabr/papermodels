/* istanbul ignore file -- @preserve */
import db, { IntegrationItemStatus } from 'db';
import { api } from 'src/blitz-server';
import fs from 'fs';

import { executeSelectorAllOnHtmlText, fetchPageAsString } from './util';
import { Decimal } from '@prisma/client/runtime';

// const scriptDependencies = `
// import {
//   readPageNodesAsString,
//   fetchPageAsString,
//   executeSelectorOnHtmlText
// } from './util';
// const {
//   readPageNodesAsString,
//   fetchPageAsString,
//   executeSelectorOnHtmlText
// } = require('./util');
// `;

const setup = {
  ignoreTexts: ['.by.Papermau.Download.Now!'], // TODO use this
  previewImagesSelector: 'div > div > div > img.caption',
  descriptionSelector: ''
  // steps: [
  //   {
  //     script: `
  //       console.log()
  //       const node = '{0}';
  //       // const a = executeSelectorOnHtmlText(node, 'a');
  //       // const page = await fetchPageAsString(url);
  //       // test();
  //     `
  //   }
  // ]
};

// const runStepScript = (script: string, params: string[]) => {
//   let finalScript = `
//     ${scriptDependencies}
//     ${script}
//   `;

//   params.forEach((param, index) => {
//     finalScript = finalScript.replace(`{${index}}`, jsEscape(param));
//   });

//   const dom = new JSDOM(
//     `
//     <body>
//       <script src="utilJS.js"></script>
//       <script>${finalScript}</script>
//     </body>`,
//     {
//       runScripts: 'dangerously',
//       resources: 'usable'
//     }
//   );
//   console.log('######', JSON.stringify(dom.window.document.scripts));
// };

const processIntegration = async () => {
  const integrationList = await db.integrationItem.findMany({
    where: {
      status: IntegrationItemStatus.pending
    },
    take: 1
  });

  if (integrationList.length > 0) {
    console.log(`[IntegrationJOB] ${integrationList.length} item(s) to be integrated found!`);
    console.log(`[IntegrationJOB] ${new Date().toISOString()} - Item integration process started.`);

    for await (const integrationItem of integrationList) {
      try {
        console.log(`[IntegrationJOB] Integrating item '${integrationItem.name}'...`);
        await db.integrationItem.update({
          where: { id: integrationItem.id },
          data: {
            status: IntegrationItemStatus.running
          }
        });

        const pageContent = await fetchPageAsString(integrationItem.url);

        // setup.steps.forEach((step) => {
        //   runStepScript(step.script, [integrationItem.node]);
        //   // The script will be executed and modify the DOM:
        //   // dom.window.document.body.children.length === 2;
        // });

        const description = '';
        const dificulty = 0;
        const categoryId = 1;
        const assemblyTime = new Decimal(1);

        // TODO save preview images
        const previewImageNodes = executeSelectorAllOnHtmlText(pageContent, setup.previewImagesSelector);

        previewImageNodes.forEach((node, index) => {
          const src = node.getAttribute('src');
          if (src) {
            void fetch(src).then(async (response) => {
              const buffer = await response.arrayBuffer();
              fs.writeFile(`image_${index}.png`, Buffer.from(buffer), () => {});
            });
          } else {
            //TODO handle error
          }
        });

        await db.item.create({
          data: {
            name: integrationItem.name,
            description,
            dificulty,
            assemblyTime,
            categoryId
          }
        });

        await db.integrationItem.update({
          where: { id: integrationItem.id },
          data: {
            status: IntegrationItemStatus.done
          }
        });
      } catch (error) {
        console.log(`[IntegrationJOB] Error trying to integrate item ${integrationItem.name}!`);
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
    console.log(`[IntegrationJOB] No items to integrate!`);
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
