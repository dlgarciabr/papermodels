import { FileType } from 'db';

export type UploadItemFile = {
  storagePath: string;
  tempId: string;
  uploadPreview?: string;
  artifactType: FileType;
  item: Item;
  index: number;
  bytes: ArrayBuffer;
};
