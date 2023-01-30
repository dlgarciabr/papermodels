export interface IThumbnailProps extends IThumbnailListItem {
  index: number;
  altText: string;
  loading?: boolean;
  src?: string;
  onClick?: (index: number) => void;
  children?: React.ReactNode;
  className?: string;
}
