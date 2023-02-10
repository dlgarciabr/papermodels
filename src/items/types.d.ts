import { FileType } from 'db';

export type UploadItemFile = {
  storagePath: string;
  tempId: string;
  item: Item;
  uploadPreview?: string;
  artifactType: FileType;
  bytes?: ArrayBuffer;
};
