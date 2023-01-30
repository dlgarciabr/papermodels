export interface IImageData {
  loading: boolean;
  name?: string;
  url?: string;
}

export interface IThumbnailsData {
  loading: boolean;
  items: { storagePath: string; finalUrl?: string }[];
}
