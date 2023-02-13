/* istanbul ignore file -- @preserve */
import { UploadApiResponse } from 'cloudinary';
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
import { IntegrationSelector } from 'types';
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

const processItemIntegration = async (simulation: boolean = false) => {
  const simulationLabel = simulation ? ' simulation ' : ' ';

  console.log(`
===================================================================================
|                     Initializing Item integration${simulationLabel}job...                        |
===================================================================================
`);

  if (!simulation) {
    const runningIntegrations = await db.itemIntegration.findMany({
      where: {
        status: ItemIntegrationStatus.running
      }
    });

    if (runningIntegrations.length > 0) {
      console.log('[ItemIntegrationJOB] Another Item integration job is running, aborting...');
      return;
    }
  }

  let integrationList: (ItemIntegration & { setup: IntegrationSetup })[] = [];

  if (simulation) {
    integrationList = (await db.itemIntegration.findMany({
      where: {
        status: ItemIntegrationStatus.simulation
      },
      include: {
        setup: true
      }
    })) as (ItemIntegration & { setup: IntegrationSetup })[];
  } else {
    integrationList = (await db.itemIntegration.findMany({
      where: {
        status: ItemIntegrationStatus.pending
      },
      take: 4,
      include: {
        setup: true
      }
    })) as (ItemIntegration & { setup: IntegrationSetup })[];
  }

  if (integrationList.length > 0) {
    console.log(
      `[ItemIntegrationJOB] ${new Date().toISOString()} - Item integration${simulationLabel}process started.`
    );
    console.log(`[ItemIntegrationJOB] ${integrationList.length} item(s) to be integrated found!`);

    const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';

    const errors: { integrationItem: number; error: Error }[] = [];

    for await (const integrationItem of integrationList) {
      try {
        console.log(`[ItemIntegrationJOB] Running integration${simulationLabel}of item '${integrationItem.name}'...`);

        if (!simulation) {
          await db.itemIntegration.update({
            where: { id: integrationItem.id },
            data: {
              status: ItemIntegrationStatus.running
            }
          });
        }

        const pageContent = await fetchPageAsString(integrationItem.url);

        let description = '';
        if (integrationItem.setup.descriptionSelector) {
          const selectors = JSON.parse(integrationItem.setup.descriptionSelector) as IntegrationSelector[];
          selectors.forEach((selector) => {
            description = getTextFromNodeAsString(pageContent, selector.value) || '';
          });
        }

        let dificulty;
        let assemblyTime;

        const previewImagesSelectors = JSON.parse(integrationItem.setup.previewImagesSelector) as IntegrationSelector[];
        let previewImageNodes: Element[] = [];

        previewImagesSelectors.forEach((selector) => {
          const nodes = executeSelectorAllOnHtmlText(pageContent, selector.value);
          previewImageNodes = [...previewImageNodes, ...Array.from(nodes)];
        });

        console.log(`[ItemIntegrationJOB] Persisting item '${integrationItem.name}'...`);

        let item;

        if (!simulation) {
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
        }

        console.log(`[ItemIntegrationJOB] Running extraction${simulationLabel}of preview images...`);
        const files: UploadItemFile[] = [];
        for await (const node of previewImageNodes) {
          const src = node.getAttribute('src');
          if (src) {
            let response = {} as UploadApiResponse;
            if (!simulation) {
              console.log(`[ItemIntegrationJOB] Uploading preview image ${src}...`);
              response = await uploadImage(src, `${ARTIFACTS_PATH}/${item.id}`);
            }
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

        if (!simulation) {
          console.log(`[ItemIntegrationJOB] Persisting preview files...`);
          await db.itemFile.createMany({
            data: files.map((file) => ({
              storagePath: file.storagePath,
              artifactType: file.artifactType,
              itemId: item.id
            }))
          });
        }

        // await db.item.update({
        //   where: { id: item.id },
        //   data: {
        //     status: ItemStatus.enable
        //   }
        // });

        if (!simulation) {
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
        }
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

    console.log(`[ItemIntegrationJOB] ${new Date().toISOString()} Item first stage integration process finished.`);

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
