import { saveFile } from 'src/utils/fileStorage';
import { UploadItemFile } from '../../items/types';

export const uploadFiles = async (files: UploadItemFile[]) => {
  const uploadedFiles: UploadItemFile[] = [];
  for await (const file of files) {
    const response = await saveFile(file);
    if (response.public_id) {
      uploadedFiles.push({
        ...file,
        storagePath: `${response.public_id}.${response.format}`
      });
    } else {
      throw Error(response);
    }
  }
  return uploadedFiles;
};

export const saveItemFiles = async (files: UploadItemFile[], createFileMutation: any) => {
  for await (const file of files) {
    await createFileMutation({
      storagePath: file.storagePath,
      artifactType: file.artifactType,
      itemId: file.item.id
    });
  }
};
