import { FileType } from '@prisma/client';
// export const FileType = {
//   instruction: 'instruction',
//   scheme: 'scheme',
//   preview: 'preview',
// } as const;

// export enum FileType {
//   instruction = 'instruction',
//   scheme = 'scheme',
//   preview = 'preview'
// }

// export enum FileType {
//   instruction,
//   scheme,
//   preview
// }

// export const FileType = {
//   instruction: 'instruction',
//   scheme: 'scheme',
//   preview: 'preview',
// }

export type UploadItemFile = File & {
  storagePath: string;
  tempId: string;
  preview: string;
  artifactType: FileType;
  item: Item;
};
