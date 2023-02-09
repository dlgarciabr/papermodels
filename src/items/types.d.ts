import { FileType } from 'db';

export type UploadItemFile = {
  storagePath: string;
  tempId: string;
  uploadPreview?: string;
  artifactType: FileType;
  item?: Item; // TODO evaluate existance
  index?: number; // TODO evaluate existance
  bytes?: ArrayBuffer; // TODO evaluate existance
};
