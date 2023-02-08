/* istanbul ignore file -- @preserve */
import db, { FileType, IntegrationItem, IntegrationItemStatus, IntegrationSetup, ItemStatus } from 'db';
import { api } from 'src/blitz-server';
import { UploadItemFile } from 'src/items/types';
import { getSimpleRandomKey } from 'src/utils/global';

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

        const previewImageNodes = executeSelectorAllOnHtmlText(
          pageContent,
          integrationItem.setup.previewImagesSelector
        );

        const item = await db.item.create({
          data: {
            name: integrationItem.name,
            description,
            dificulty,
            assemblyTime,
            categoryId: integrationItem.categoryId,
            status: ItemStatus.integrating
          }
        });

        const images: UploadItemFile[] = [];
        for await (const node of previewImageNodes) {
          const src = node.getAttribute('src');
          if (src) {
            const buffer = await (await fetch(src)).arrayBuffer();
            // const file = new File([buffer], 'tempFile');
            const file: UploadItemFile = {
              storagePath: '',
              item,
              artifactType: FileType.preview,
              bytes: buffer,
              index: 0,
              tempId: getSimpleRandomKey()
            };
            images.push(file);
            //fs.writeFile(`image_${index}.png`, Buffer.from(buffer), () => { });
          } else {
            throw new Error(`Error integrating image ${node}`);
            //TODO handle error
          }
        }

        //const processedFiles = await processFiles(images);
        //await uploadFiles(processedFiles);

        // await db.itemFile.createMany({
        //   data: processedFiles.map((file) => ({
        //     storagePath: file.storagePath,
        //     artifactType: file.artifactType,
        //     itemId: file.item.id,
        //     index: file.index
        //   }))
        // });

        // for await (const file of processedFiles) {
        //   const index = ++file.item.files.length;
        //   await createFileMutation({
        //     storagePath: file.storagePath,
        //     artifactType: file.artifactType,
        //     itemId: file.item.id,
        //     index
        //   });
        // }

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
