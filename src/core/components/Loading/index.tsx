import { CircularProgress, Grid } from '@mui/material';
import { memo, useEffect, useState } from 'react';

export const Loading = ({ visible = true }: { visible?: boolean }) => {
  const [height, setHeight] = useState<number>(0);
  const [marginTop, setMarginTop] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      (document as any).body.style.overflowY = 'disable';
    } else {
      (document as any).body.style.overflowY = 'scroll';
    }
    const documentHeight = document.body.clientHeight + 50;
    const visiblePageHeight = window.innerHeight;
    const scrollY = window.scrollY;
    setMarginTop(visiblePageHeight / 2 + scrollY - 20);
    setHeight(documentHeight);
  }, [visible]);

  return (
    <Grid
      container
      className='loading'
      height={`${height}px`}
      justifyContent='center'
      visibility={visible ? 'visible' : 'hidden'}>
      <Grid item>{visible && <CircularProgress style={{ marginTop: `${marginTop}px` }} />}</Grid>
    </Grid>
  );
};

export default memo(Loading);
