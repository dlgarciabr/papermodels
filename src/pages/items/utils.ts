import { FileType, Item, ItemFile } from 'db';
import { deleteFile, getFilePath, saveFile } from 'src/utils/fileStorage';
import { compressImage, generateThumbnailArrayBuffer } from 'src/utils/image';
import { removeDiacritics } from 'src/utils/string';
import { UploadItemFile } from '../../items/types';

export const processFiles = async (files: UploadItemFile[]) => {
  const processedFiles: UploadItemFile[] = [];
  for await (const file of files) {
    const index = ++file.item.files.length;
    // TODO validate some extensions for each artifact types
    const name = removeDiacritics(file.item.name).replaceAll(' ', '_').toLowerCase();
    const extension = file.name.split('.')[1];
    const storagePath = `${file.item.id}/${name}_${file.artifactType}_${index}`;
    const imageBytes = await file.arrayBuffer();

    if (file.artifactType === FileType.preview) {
      const thumbFileName = `${storagePath}_thumb.${extension}`;
      const thumbnailBytes = await generateThumbnailArrayBuffer(imageBytes);
      const compressedThumbnail = await compressImage(thumbnailBytes);
      const thumbnailCompressedBytes = await compressedThumbnail.arrayBuffer();
      const thumbnailFile = new File([thumbnailCompressedBytes], thumbFileName) as UploadItemFile;
      thumbnailFile.artifactType = FileType.thumbnail;
      thumbnailFile.storagePath = thumbFileName;
      thumbnailFile.item = file.item;
      processedFiles.push(thumbnailFile);
    }

    const fileName = `${storagePath}.${extension}`;
    const processedFile = new File([imageBytes], fileName) as UploadItemFile;
    processedFile.artifactType = file.artifactType;
    processedFile.storagePath = fileName;
    processedFile.item = file.item;
    processedFiles.push(processedFile);
  }
  return processedFiles;
};
// TODO clean if new function is working well
// export const uploadFiles = (files: UploadItemFile[]) =>
//   Promise.all(
//     files.map(async (file) => {
//       const index = ++file.item.files.length;
//       // TODO replace all special caracters of the name
//       // TODO validate some extensions for each artifact types
//       const name = file.item.name.replaceAll(' ', '_').toLowerCase();
//       const extension = file.name.split('.')[1];
//       const storagePath = `${file.item.id}/${name}_${file.artifactType}_${index}`;
//       file.storagePath = storagePath;
//       const imageBytes = await file.arrayBuffer();

//       if (file.artifactType === FileType.preview) {
//         const thumbnailBytes = await generateThumbnailArrayBuffer(imageBytes);
//         const compressedThumbnail = await compressImage(thumbnailBytes);
//         const thumbnailCompressedBytes = await compressedThumbnail.arrayBuffer();
//         const thumbnailFile = (new File([thumbnailCompressedBytes], `${storagePath}_thumb.${extension}`)) as UploadItemFile;
//         thumbnailFile.artifactType = FileType.thumbnail;
//         await saveFile(thumbnailFile);
//       }
//       const temporaryFile = new File([imageBytes], `${storagePath}.${extension}`);
//       await saveFile(temporaryFile);
//     })
//   );

export const uploadFiles = (files: UploadItemFile[]) =>
  Promise.all(
    files.map(async (file) => {
      await saveFile(file);
    })
  );

export const saveItemFiles = async (files: UploadItemFile[], createFileMutation: any) => {
  // TODO clean if the uncommented lines are working well
  // const promises: Promise<void>[] = [];
  // files.forEach((file) => {
  //   const index = ++file.item.files.length;
  //   promises.push(
  //     createFileMutation({
  //       storagePath: file.storagePath,
  //       artifactType: file.artifactType,
  //       itemId: file.item.id,
  //       index
  //     })
  //   );
  // });
  // await Promise.all(promises);
  for await (const file of files) {
    const index = ++file.item.files.length;
    try {
      await createFileMutation({
        storagePath: file.storagePath,
        artifactType: file.artifactType,
        itemId: file.item.id,
        index
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

export const sortFilesIndexes = async (
  item: Item,
  files: ItemFile[],
  updateItemFileMutation: any
): Promise<ItemFile[]> => {
  if (files.length === 0) {
    return [];
  }
  if (files.length === 1 && files[0]?.index === 0) {
    return files; //TODO improve index validation to suport n items on files and avoid more logic to be called
  }
  const lockFileStorageName = `${item.id}/.lock`;

  await saveFile(new File([], lockFileStorageName));

  const promises: Promise<void>[] = [];
  const updatedFiles: ItemFile[] = [];

  files.forEach((file, index) => {
    promises.push(
      new Promise(async (resolve) => {
        const backupFileName = `${file.storagePath}_bak`;
        const url = await getFilePath(file.storagePath);

        const response = await fetch(url, { method: 'GET' });
        const blob = await response.blob();

        await saveFile(new File([blob], backupFileName));
        await deleteFile(file.storagePath);

        const name = removeDiacritics(item.name).replaceAll(' ', '_').toLowerCase();
        const extension = file.storagePath.split('.')[1];
        const newStoragePath = `${item.id}/${name}_${file.artifactType}_${index + 1}.${extension}`;

        await saveFile(new File([blob], newStoragePath));
        await deleteFile(backupFileName);

        const updatedFile = await updateItemFileMutation({
          ...file,
          storagePath: newStoragePath,
          index
        });

        updatedFiles.push(updatedFile);
        resolve();
      })
    );
  });

  await Promise.all(promises);

  await deleteFile(lockFileStorageName);

  return updatedFiles;
};
