import { memo } from 'react';
import { getSimpleRandomKey } from 'src/utils/global';
import Thumbnail from './Thumbnail';
import { IThumbnailListProps } from './types';

export const ThumbnailList = (props: IThumbnailListProps) => {
  return (
    <>
      {props.items.map((item, index) => (
        <Thumbnail key={getSimpleRandomKey()} {...item} index={index}>
          {item.children}
        </Thumbnail>
      ))}
    </>
  );
};

export const MemoizedThumbnailList = memo(ThumbnailList);
