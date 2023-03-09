import { FileType, ItemFile } from '@prisma/client';
import { downloadFile } from 'src/utils/global';
import { ItemWithChildren } from 'types';

export const useDownloadFiles = (item?: ItemWithChildren) => async (artifactType: FileType) => {
  if (!item) {
    return;
  }
  const filesToDownload = item.files.filter((file) => file.artifactType === artifactType);
  for await (const file of filesToDownload) {
    await downloadFile(file.storagePath);
  }
};

export const useHasFileType = () => (artifactType: FileType, files: ItemFile[]) => {
  return files.some((file) => file.artifactType === artifactType);
};
