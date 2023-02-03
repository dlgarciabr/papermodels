import { FileType } from 'db';

export type UploadItemFile = File & {
  storagePath: string;
  tempId: string;
  uploadPreview: string;
  artifactType: FileType;
  item: Item;
};
