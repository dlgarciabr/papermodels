import { Item, ItemFile } from 'db';
import { deleteFile, getFilePath, saveFile } from 'src/utils/fileStorage';
import { UploadItemFile } from '../../items/types';

// const pocThumbnailCreation = (blob) => {
//   loadImage(
//     blob,
//     function (img, data) {
//       console.log('Original image head: ', data.imageHead)
//       console.log('Exif data: ', data.exif) // requires exif extension
//       console.log('IPTC data: ', data.iptc) // requires iptc extension
//     },
//     { meta: true }
//   )
// }

export const uploadFiles = (files: UploadItemFile[]) =>
  Promise.all(
    files.map(async (file) => {
      const index = ++file.item.files.length;
      //TODO replace all special caracters of the name
      const name = file.item.name.replaceAll(' ', '_').toLowerCase();
      const extension = file.name.split('.')[1];
      const storagePath = `${file.item.id}/${name}_${file.artifactType}_${index}.${extension}`;
      file.storagePath = storagePath;
      // pocThumbnailCreation(file.arrayBuffer())
      // throw 'fakeError'
      const bytes = await file.arrayBuffer();
      const temporaryFile = new File([bytes], storagePath);
      await saveFile(temporaryFile);
    })
  );

export const saveItemFiles = async (files: UploadItemFile[], createFileMutation: any) => {
  const promises: Promise<void>[] = [];
  files.forEach((file) => {
    const index = ++file.item.files.length;
    promises.push(
      createFileMutation({
        storagePath: file.storagePath,
        artifactType: file.artifactType,
        itemId: file.item.id,
        index
      })
    );
  });
  await Promise.all(promises);
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
    return files;
  } //TODO improve index validation to suport n items on files and avoid more logic to be called
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

        const name = item.name.replaceAll(' ', '_').toLowerCase();
        const extension = file.storagePath.split('.')[1];
        const newStoragePath = `${item.id}/${name}_${file.artifactType}_${index + 1}.${extension}`;

        await saveFile(new File([blob], newStoragePath));
        await deleteFile(backupFileName);

        const updatedFile = await updateItemFileMutation({
          id: file.id,
          storagePath: newStoragePath,
          artifactType: file.artifactType,
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
