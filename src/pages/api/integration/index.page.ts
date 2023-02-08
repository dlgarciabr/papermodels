/* istanbul ignore file -- @preserve */
import db, { IntegrationItem, IntegrationItemStatus, IntegrationSetup } from 'db';
import { api } from 'src/blitz-server';

// import fs from 'fs';
import { executeSelectorAllOnHtmlText, fetchPageAsString, getTextFromNodeAsString } from './util';

// const setup = {
//   // ignoreTexts: ['.by.Papermau.Download.Now!'], // TODO use this
// };

const processIntegration = async () => {
  const integrationList = (await db.integrationItem.findMany({
    where: {
      status: IntegrationItemStatus.pending
    },
    take: 1,
    include: {
      setup: true
    }
  })) as (IntegrationItem & { setup: IntegrationSetup })[];

  if (integrationList.length > 0) {
    console.log(`[IntegrationJOB] ${integrationList.length} item(s) to be integrated found!`);
    console.log(`[IntegrationJOB] ${new Date().toISOString()} - Item integration process started.`);

    for await (const integrationItem of integrationList) {
      try {
        console.log(`[IntegrationJOB] Integrating item '${integrationItem.name}'...`);
        // await db.integrationItem.update({
        //   where: { id: integrationItem.id },
        //   data: {
        //     status: IntegrationItemStatus.running
        //   }
        // });

        const pageContent = await fetchPageAsString(integrationItem.url);

        let description;
        if (integrationItem.setup.descriptionSelector) {
          description = getTextFromNodeAsString(pageContent, integrationItem.setup.descriptionSelector);
        }

        let dificulty;
        let assemblyTime;

        // TODO save preview images
        const previewImageNodes = executeSelectorAllOnHtmlText(
          pageContent,
          integrationItem.setup.previewImagesSelector
        );

        let index = 0;
        // const images = [];
        for await (const node of previewImageNodes) {
          const src = node.getAttribute('src');
          if (src) {
            // eslint-disable-next-line unused-imports/no-unused-vars
            const buffer = await (await fetch(src)).arrayBuffer();
            //fs.writeFile(`image_${index}.png`, Buffer.from(buffer), () => { });
            // eslint-disable-next-line unused-imports/no-unused-vars
            index++;
          } else {
            //TODO handle error
          }
        }

        // previewImageNodes.forEach((node, index) => {
        //   const src = node.getAttribute('src');
        //   if (src) {
        //     void fetch(src).then(async (response) => {
        //       // const buffer = await response.arrayBuffer();
        //       // fs.writeFile(`image_${index}.png`, Buffer.from(buffer), () => { });
        //     });
        //   } else {
        //     //TODO handle error
        //   }
        // });

        await db.item.create({
          data: {
            name: integrationItem.name,
            description,
            dificulty,
            assemblyTime,
            categoryId: integrationItem.categoryId
          }
        });

        // await db.integrationItem.update({
        //   where: { id: integrationItem.id },
        //   data: {
        //     status: IntegrationItemStatus.done
        //   }
        // });
      } catch (error) {
        console.log(`[IntegrationJOB] Error trying to integrate item ${integrationItem.name}!`);
        console.log(error);
        await db.integrationItem.update({
          where: { id: integrationItem.id },
          data: {
            error: error.message,
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
