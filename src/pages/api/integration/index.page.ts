/* istanbul ignore file -- @preserve */
import { UploadApiResponse } from 'cloudinary';
import db, {
  FileType,
  ItemIntegration,
  ItemIntegrationStatus,
  IntegrationSetup,
  ItemStatus,
  FileIntegrationStatus,
  IntegrationLog
} from 'db';
import { api } from 'src/blitz-server';
import { UploadItemFile } from 'src/items/types';
import { IntegrationSelector, ItemSimulationReference } from 'types';
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
        status: ItemIntegrationStatus.pendingSimulation
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
    console.log(
      `[ItemIntegrationJOB] ${integrationList.length} item(s) to be ${simulation ? 'simulated' : 'integrated'} found!`
    );

    const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';

    const errors: { itemIntegration: number; error: Error }[] = [];

    let logs: Partial<IntegrationLog>[] = [];

    for await (const itemIntegration of integrationList) {
      const singleIntegrationLogs: Partial<IntegrationLog>[] = [];
      let hasPreviewImages = true;
      let hasDescription = true;

      try {
        console.log(`[ItemIntegrationJOB] Running integration${simulationLabel}of item '${itemIntegration.name}'...`);

        if (!simulation) {
          await db.itemIntegration.update({
            where: { id: itemIntegration.id },
            data: {
              status: ItemIntegrationStatus.running
            }
          });
        }

        const pageContent = await fetchPageAsString(itemIntegration.url);

        let description = '';
        if (itemIntegration.setup.descriptionSelector) {
          const selectors = JSON.parse(itemIntegration.setup.descriptionSelector) as IntegrationSelector[];
          selectors.forEach((selector) => {
            description = getTextFromNodeAsString(pageContent, selector.value) || '';
          });
        }

        hasDescription = !!description;

        let dificulty;
        let assemblyTime;

        const previewImagesSelectors = JSON.parse(itemIntegration.setup.previewImagesSelector) as IntegrationSelector[];
        let previewImageNodes: Element[] = [];

        previewImagesSelectors.forEach((selector) => {
          const nodes = executeSelectorAllOnHtmlText(pageContent, selector.value);
          previewImageNodes = [...previewImageNodes, ...Array.from(nodes)];
        });

        let item;

        if (!simulation) {
          console.log(`[ItemIntegrationJOB] Persisting item '${itemIntegration.name}'...`);
          try {
            item = await db.item.create({
              data: {
                name: removeExpressions(itemIntegration.name, itemIntegration.setup.ignoreExpressions).trim(),
                description: removeExpressions(description, itemIntegration.setup.ignoreExpressions).trim(),
                dificulty,
                assemblyTime,
                categoryId: itemIntegration.categoryId,
                status: ItemStatus.integrating
              }
            });
          } catch (error) {
            const itemExists = error.message.indexOf('Unique constraint failed on the fields: (`name`)') > 0;
            if (itemExists) {
              //just ignore repeated item and do not stop the whole process
              console.log(`[ItemIntegrationJOB] Item '${itemIntegration.name}' alread exists, being ignored...`);
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
            // throw new Error(`Error integrating image ${node}`);
          }
        }

        hasPreviewImages = files.length > 0;

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

        if (simulation) {
          await db.fileIntegration.create({
            data: {
              selector: itemIntegration.setup.schemesSelector,
              itemIntegrationId: itemIntegration.id,
              integrationType: FileType.scheme,
              url: itemIntegration.url,
              status: FileIntegrationStatus.pendingSimulation
            }
          });

          singleIntegrationLogs.push({
            integrationId: itemIntegration.id,
            key: ItemSimulationReference.hasPreviewImages,
            reference: itemIntegration.name,
            value: String(hasPreviewImages)
          });

          singleIntegrationLogs.push({
            integrationId: itemIntegration.id,
            key: ItemSimulationReference.hasDescription,
            reference: itemIntegration.name,
            value: String(hasDescription)
          });

          await db.integrationLog.createMany({
            data: singleIntegrationLogs as IntegrationLog[]
          });

          logs = [...logs, ...singleIntegrationLogs];
        } else {
          console.log(`[ItemIntegrationJOB] Enqueueing scheme file integration...`);

          await db.fileIntegration.create({
            data: {
              selector: itemIntegration.setup.schemesSelector,
              itemIntegrationId: itemIntegration.id,
              integrationType: FileType.scheme,
              url: itemIntegration.url,
              status: FileIntegrationStatus.pending
            }
          });

          await db.itemIntegration.update({
            where: { id: itemIntegration.id },
            data: {
              itemId: item.id,
              status: ItemIntegrationStatus.pendingFiles
            }
          });
        }
      } catch (error) {
        console.log(`[ItemIntegrationJOB] Error trying to integrate item ${itemIntegration.name}!`);
        console.log(error);
        await db.itemIntegration.update({
          where: { id: itemIntegration.id },
          data: {
            error: error.message,
            status: ItemIntegrationStatus.error
          }
        });
        errors.push({ itemIntegration: itemIntegration.id, error });
      }
    }

    if (simulation && integrationList.length > 0) {
      const containsPreviewImages = logs.filter(
        (log) => log.key === ItemSimulationReference.hasPreviewImages && log.value === 'true'
      );

      const containsDescription = logs.filter(
        (log) => log.key === ItemSimulationReference.hasDescription && log.value === 'true'
      );

      await db.integrationLog.createMany({
        data: [
          {
            key: ItemSimulationReference.previewImagesPencentage,
            reference: 'Global',
            value: `${String(Math.round((containsPreviewImages.length * 100) / integrationList.length))}%`
          },
          {
            key: ItemSimulationReference.descriptionPencentage,
            reference: 'Global',
            value: `${String(Math.round((containsDescription.length * 100) / integrationList.length))}%`
          }
        ]
      });
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
  // if (req.method === 'POST') {
  const simulation = !!req.query.simulation;
  const processReturn = await processItemIntegration(simulation);
  res.status(200).send(processReturn);
  // } else {
  //   res.status(501).send({});
  // }
});
