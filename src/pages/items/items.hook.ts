import { FileType, Item, ItemFile } from '@prisma/client';
import { downloadFile } from 'src/utils/global';

export const useDownloadFiles = (item: Item & { files: ItemFile[] }) => (artifactType: FileType) => {
  const filesToDownload = item.files.filter((file) => file.artifactType === artifactType);
  filesToDownload.forEach((file) => {
    void downloadFile(file.storagePath);
  });
};
