import { FileType } from 'db';
import { saveFile } from 'src/utils/fileStorage';
import { UploadItemFile } from './types';

export const saveFiles = async (itemId: number, files: UploadItemFile[]) => {
  const saveFilePromises: Promise<void>[] = [];
  files.forEach((file, index) => {
    file.artifactType = FileType.scheme; // TODO receive as parameter
    const extension = file.name.split('.')[1];
    file.storageName = `${file.artifactType}s/${itemId}_${index}.${extension}`;
    saveFilePromises.push(saveFile(file));
  });
  await Promise.all(saveFilePromises);
};
