import { FileType } from 'db';

export interface IImageData {
  loading: boolean;
  name?: string;
  url?: string;
}

export interface IThumbnail {
  type: FileType;
  storagePath: string;
  finalUrl?: string;
}

export interface IThumbnailsData {
  loading: boolean;
  items: IThumbnail[];
}
