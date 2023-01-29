export interface IThumbnailListItem {
  src?: string;
  altText?: string;
  onClick?: (index: number) => void;
  children?: React.ReactNode;
  className?: string;
}

export interface IThumbnailListProps {
  items: IThumbnailListItem[];
}

export interface IThumbnailProps extends IThumbnailListItem {
  index: number;
}
