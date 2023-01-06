import { FileType } from 'db';
import { saveFile } from 'src/utils/fileStorage';
import { UploadItemFile } from './types';

export const uploadFiles = async (files: UploadItemFile[]) => {
  const promises: Promise<void>[] = [];
  files.forEach((file) => {
    file.artifactType = FileType.scheme; // TODO receive as parameter
    const index = ++file.item.files.length;
    const name = file.item.name.replaceAll(' ', '_').toLowerCase();
    const extension = file.name.split('.')[1];
    const storageName = `${file.item.id}/${name}_${file.artifactType}_${index}.${extension}`;
    file.storageName = storageName;
    promises.push(saveFile(file));
  });
  await Promise.all(promises);
};

export const saveItemFiles = async (files: UploadItemFile[], mutation: any) => {
  const promises: Promise<void>[] = [];
  files.forEach((file) => {
    promises.push(
      mutation({
        id: file.storageName,
        artifactType: file.artifactType,
        itemId: file.item.id
      })
    );
  });
  await Promise.all(promises);
};
