/* istanbul ignore file -- @preserve */
import db, { FileType, IntegrationItem, IntegrationItemStatus, IntegrationSetup, ItemStatus } from 'db';
import { api } from 'src/blitz-server';
import { UploadItemFile } from 'src/items/types';
import { uploadImage } from '../file/image-upload.page';
import { executeSelectorAllOnHtmlText, fetchPageAsString, getTextFromNodeAsString } from './util';

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

    const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';

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
            const response = await uploadImage(src, `${ARTIFACTS_PATH}/${item.id}`);
            const file: UploadItemFile = {
              storagePath: `${response.public_id}.${response.format}`,
              item: { ...item, files: [] },
              artifactType: FileType.preview,
              tempId: ''
            };
            images.push(file);
          } else {
            throw new Error(`Error integrating image ${node}`);
            //TODO handle error
          }
        }

        await db.itemFile.createMany({
          data: images.map((file) => ({
            storagePath: file.storagePath,
            artifactType: file.artifactType,
            itemId: item.id
          }))
        });

        await db.item.update({
          where: { id: item.id },
          data: {
            status: ItemStatus.enable
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
  res.status(200).send({});
});
