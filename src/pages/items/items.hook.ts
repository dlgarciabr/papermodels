import { FileType } from '@prisma/client';
import { downloadFile } from 'src/utils/global';
import { ItemWithChildren } from 'types';

export const useDownloadFiles = (item?: ItemWithChildren) => (artifactType: FileType) => {
  if (!item) {
    return;
  }
  const filesToDownload = item.files.filter((file) => file.artifactType === artifactType);
  filesToDownload.forEach((file) => {
    void downloadFile(file.storagePath);
  });
};
