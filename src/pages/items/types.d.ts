export interface IImageData {
  loading: boolean;
  name?: string;
  url?: string;
}

export interface IThumbnailsData {
  loading: boolean;
  total: number;
  storagePaths: string[];
  finalUrls: string[];
}
