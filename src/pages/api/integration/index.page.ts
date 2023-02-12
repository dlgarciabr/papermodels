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

// const downloadPath = path.resolve('./download');

// const setup = {
//   schemesSelector: 'div.card-body > div > div > a.download-on-click',
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

// const checkDownloadFinished = async () => {
//   process.stdout.write('.');
//   const files = fs.readdirSync(downloadPath);
//   if (files.length === 0 || files[0]!.indexOf('crdownload') > 0) {
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     return checkDownloadFinished();
//   }
//   return true;
// };

const processIntegration = async () => {
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
    console.log(`[IntegrationJOB] ${integrationList.length} item(s) to be integrated found!`);
    console.log(`[IntegrationJOB] ${new Date().toISOString()} - Item integration process started.`);

    const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';

    for await (const integrationItem of integrationList) {
      try {
        console.log(`[IntegrationJOB] Integrating item '${integrationItem.name}'...`);
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

        console.log(`[IntegrationJOB] Persisting item '${integrationItem.name}'...`);
        const item = await db.item.create({
          data: {
            name: removeExpressions(integrationItem.name, integrationItem.setup.ignoreExpressions).trim(),
            description: removeExpressions(description, integrationItem.setup.ignoreExpressions).trim(),
            dificulty,
            assemblyTime,
            categoryId: integrationItem.categoryId,
            status: ItemStatus.integrating
          }
        });

        console.log(`[IntegrationJOB] Extracting preview images...`);
        const files: UploadItemFile[] = [];
        for await (const node of previewImageNodes) {
          const src = node.getAttribute('src');
          if (src) {
            console.log(`[IntegrationJOB] Uploading preview image ${src}...`);
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

        // const downloadedFile = await downloadFileFromClick(integrationItem.url, setup.schemesSelector);

        // const downloadedFileWraper: UploadItemFile = {
        //   storagePath: '',
        //   item: { ...item, files: [] },
        //   artifactType: FileType.scheme,
        //   tempId: '',
        //   bytes: downloadedFile
        // };

        // const uploadedFiles = await uploadFiles([downloadedFileWraper]);

        // if (uploadFiles.length > 0) {
        //   files.push(uploadedFiles[0]!);
        // }

        //TODO save scheme file on integration table

        await db.fileIntegration.create({
          data: {
            itemId: item.id,
            selector: integrationItem.setup.schemesSelector,
            integrationType: FileType.scheme,
            url: integrationItem.url,
            status: FileIntegrationStatus.pending
          }
        });

        console.log(`[IntegrationJOB] Persisting files...`);

        await db.itemFile.createMany({
          data: files.map((file) => ({
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

        await db.itemIntegration.update({
          where: { id: integrationItem.id },
          data: {
            status: ItemIntegrationStatus.done
          }
        });
      } catch (error) {
        console.log(`[IntegrationJOB] Error trying to integrate item ${integrationItem.name}!`);
        console.log(error);
        await db.itemIntegration.update({
          where: { id: integrationItem.id },
          data: {
            error: error.message,
            status: ItemIntegrationStatus.error
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
