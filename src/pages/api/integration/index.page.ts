/* istanbul ignore file -- @preserve */
import db, {
  FileType,
  ItemIntegration,
  ItemIntegrationStatus,
  IntegrationSetup,
  ItemStatus,
  FileIntegrationStatus
} from 'db';
import { api } from 'src/blitz-server';
import { UploadItemFile } from 'src/items/types';
import { uploadImage } from '../file/image-upload.page';
import { executeSelectorAllOnHtmlText, fetchPageAsString, getTextFromNodeAsString } from './util';

// const setup = {
//   instructionsSelector: ''
// };

const removeExpressions = (text: string, setupIgnoreExpressions: string | null) => {
  if (setupIgnoreExpressions) {
    const expressionsToIgnore: string[] = JSON.parse(setupIgnoreExpressions);
    const regex = new RegExp('\\b' + expressionsToIgnore.join('|') + '\\b', 'gi');
    return text.replace(regex, '');
  }
  return text;
};

const processItemIntegration = async () => {
  console.log(`
===================================================================================
|                     Initializing Item integration job...                        |
===================================================================================
`);
  const runningIntegrations = await db.itemIntegration.findMany({
    where: {
      status: ItemIntegrationStatus.running
    }
  });

  if (runningIntegrations.length > 0) {
    console.log('[ItemIntegrationJOB] Another Item integration job is running, aborting...');
    return;
  }

  const integrationList = (await db.itemIntegration.findMany({
    where: {
      status: ItemIntegrationStatus.pending
    },
    take: 1,
    include: {
      setup: true
    }
  })) as (ItemIntegration & { setup: IntegrationSetup })[];

  if (integrationList.length > 0) {
    console.log(`[ItemIntegrationJOB] ${new Date().toISOString()} - Item integration process started.`);
    console.log(`[ItemIntegrationJOB] ${integrationList.length} item(s) to be integrated found!`);

    const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';

    const errors: { integrationItem: number; error: Error }[] = [];

    for await (const integrationItem of integrationList) {
      try {
        console.log(`[ItemIntegrationJOB] Integrating item '${integrationItem.name}'...`);
        await db.itemIntegration.update({
          where: { id: integrationItem.id },
          data: {
            status: ItemIntegrationStatus.running
          }
        });

        const pageContent = await fetchPageAsString(integrationItem.url);

        let description = '';
        if (integrationItem.setup.descriptionSelector) {
          description = getTextFromNodeAsString(pageContent, integrationItem.setup.descriptionSelector) || '';
        }

        let dificulty;
        let assemblyTime;

        const previewImageNodes = executeSelectorAllOnHtmlText(
          pageContent,
          integrationItem.setup.previewImagesSelector
        );

        console.log(`[ItemIntegrationJOB] Persisting item '${integrationItem.name}'...`);

        let item;

        try {
          item = await db.item.create({
            data: {
              name: removeExpressions(integrationItem.name, integrationItem.setup.ignoreExpressions).trim(),
              description: removeExpressions(description, integrationItem.setup.ignoreExpressions).trim(),
              dificulty,
              assemblyTime,
              categoryId: integrationItem.categoryId,
              status: ItemStatus.integrating
            }
          });
        } catch (error) {
          const itemExists = error.message.indexOf('Unique constraint failed on the fields: (`name`)') > 0;
          if (itemExists) {
            //just ignore repeated item and do not stop the whole process
            console.log(`[ItemIntegrationJOB] Item '${integrationItem.name}' alread exists, being ignored...`);
            continue;
          } else {
            throw error;
          }
        }

        console.log(`[ItemIntegrationJOB] Extracting preview images...`);
        const files: UploadItemFile[] = [];
        for await (const node of previewImageNodes) {
          const src = node.getAttribute('src');
          if (src) {
            console.log(`[ItemIntegrationJOB] Uploading preview image ${src}...`);
            const response = await uploadImage(src, `${ARTIFACTS_PATH}/${item.id}`);
            const file: UploadItemFile = {
              storagePath: `${response.public_id}.${response.format}`,
              item: { ...item, files: [] },
              artifactType: FileType.preview,
              tempId: ''
            };
            files.push(file);
          } else {
            throw new Error(`Error integrating image ${node}`);
          }
        }

        console.log(`[ItemIntegrationJOB] Persisting preview files...`);

        await db.itemFile.createMany({
          data: files.map((file) => ({
            storagePath: file.storagePath,
            artifactType: file.artifactType,
            itemId: item.id
          }))
        });

        // await db.item.update({
        //   where: { id: item.id },
        //   data: {
        //     status: ItemStatus.enable
        //   }
        // });

        console.log(`[ItemIntegrationJOB] Enqueueing scheme file integration...`);

        await db.fileIntegration.create({
          data: {
            itemId: item.id,
            selector: integrationItem.setup.schemesSelector,
            itemIntegrationId: integrationItem.id,
            integrationType: FileType.scheme,
            url: integrationItem.url,
            status: FileIntegrationStatus.pending
          }
        });

        await db.itemIntegration.update({
          where: { id: integrationItem.id },
          data: {
            status: ItemIntegrationStatus.pendingFiles
          }
        });
      } catch (error) {
        console.log(`[ItemIntegrationJOB] Error trying to integrate item ${integrationItem.name}!`);
        console.log(error);
        await db.itemIntegration.update({
          where: { id: integrationItem.id },
          data: {
            error: error.message,
            status: ItemIntegrationStatus.error
          }
        });
        errors.push({ integrationItem: integrationItem.id, error });
      }
    }

    console.log(`[ItemIntegrationJOB] ${new Date().toISOString()} Item fist stage integration process finished.`);

    if (errors.length > 0) {
      return { message: 'error', errors };
    } else {
      return { message: 'ok' };
    }
  } else {
    console.log(`[ItemIntegrationJOB] No items to be integrated!`);
  }
};

export default api(async (req, res, _ctx) => {
  if (req.method === 'POST') {
    const processReturn = await processItemIntegration();
    res.status(200).send(processReturn);
  } else {
    res.status(501).send({});
  }
});
