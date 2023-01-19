import { FileType } from 'db';

export type UploadItemFile = File & {
  storagePath: string;
  tempId: string;
  preview: string;
  artifactType: FileType;
  item: Item;
};
