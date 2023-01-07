export type UploadItemFile = File & {
  storagePath: string;
  id: string;
  preview: string;
  artifactType: FileType;
  item: Item;
};
