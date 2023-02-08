import { FileType, Item, ItemFile } from 'db';
import { deleteFile, getFilePath, saveFile } from 'src/utils/fileStorage';
import { compressImage, generateThumbnailArrayBuffer } from 'src/utils/image';
import { removeDiacritics } from 'src/utils/string';
import { UploadItemFile } from '../../items/types';

export const processFiles = async (files: UploadItemFile[]) => {
  const processedFiles: UploadItemFile[] = [];
  for await (const file of files) {
    const index = ++file.item.files.length;
    const name = removeDiacritics(file.item.name).replaceAll(' ', '_').toLowerCase();
    const extension = file.storagePath.split('.')[1];
    const storagePath = `${file.item.id}/${name}_${file.artifactType}_${index}`;
    const imageBytes = file.bytes;
    /* istanbul ignore if @preserve */
    if (file.artifactType === FileType.preview) {
      const thumbFilePath = `${storagePath}_thumb.${extension}`;
      const thumbnailBytes = await generateThumbnailArrayBuffer(imageBytes);
      const compressedThumbnail = await compressImage(thumbnailBytes);
      const thumbnailCompressedBytes = await compressedThumbnail.arrayBuffer();
      const thumbnailFile = {} as UploadItemFile;
      thumbnailFile.bytes = thumbnailCompressedBytes;
      thumbnailFile.artifactType = FileType.thumbnail;
      thumbnailFile.storagePath = thumbFilePath;
      thumbnailFile.item = file.item;
      thumbnailFile.index = index;
      processedFiles.push(thumbnailFile);
    }

    const filePath = `${storagePath}.${extension}`;
    const processedFile = { ...file };
    processedFile.artifactType = file.artifactType;
    processedFile.storagePath = filePath;
    processedFile.item = file.item;
    processedFile.index = index;
    processedFiles.push(processedFile);
  }
  return processedFiles;
};

export const uploadFiles = (files: UploadItemFile[]) =>
  Promise.all(
    files.map(async (file) => {
      await saveFile(file);
    })
  );

export const saveItemFiles = async (files: UploadItemFile[], createFileMutation: any) => {
  for await (const file of files) {
    await createFileMutation({
      storagePath: file.storagePath,
      artifactType: file.artifactType,
      itemId: file.item.id,
      index: file.index
    });
  }
};

export const sortFilesIndexes = async (
  item: Item,
  files: ItemFile[],
  updateItemFileMutation: any
): Promise<ItemFile[]> => {
  if (files.length === 0 || (files.length === 1 && files[0]?.index === 0)) {
    return files;
  }
  const lockFileStorageName = `${item.id}/.lock`;

  await saveFile({ bytes: new ArrayBuffer(0), storagePath: lockFileStorageName } as UploadItemFile);

  const promises: Promise<void>[] = [];
  const updatedFiles: ItemFile[] = [];

  files.forEach((file, index) => {
    promises.push(
      new Promise(async (resolve) => {
        const backupFileName = `${file.storagePath}_bak`;
        const url = await getFilePath(file.storagePath);

        const response = await fetch(url, { method: 'GET' });

        const blob = await response.blob();

        await saveFile({ bytes: await blob.arrayBuffer(), storagePath: backupFileName } as UploadItemFile);
        await deleteFile(file.storagePath);

        const name = removeDiacritics(item.name).replaceAll(' ', '_').toLowerCase();
        const extension = file.storagePath.split('.')[1];
        const newStoragePath = `${item.id}/${name}_${file.artifactType}_${index + 1}.${extension}`;

        await saveFile({ bytes: await blob.arrayBuffer(), storagePath: newStoragePath } as UploadItemFile);
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
