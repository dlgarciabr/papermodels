import { CircularProgress, Grid } from '@mui/material';
import { memo, useEffect, useState } from 'react';

export const Loading = ({ visible = true }: { visible?: boolean }) => {
  const [height, setHeight] = useState<number>(0);
  const [marginTop, setMarginTop] = useState<number>(0);

  useEffect(() => {
    const documentHeight = document.body.clientHeight + 40 + document.body.getBoundingClientRect().y * -1;
    const visiblePageHeight = window.innerHeight;
    const scrollY = window.scrollY;
    console.log('useEffect', visible);
    console.log('documentHeight', documentHeight);
    console.log('visiblePageHeight', visiblePageHeight);
    if (visible) {
      (document as any).body.style.overflowY = 'disable';
      setHeight(documentHeight);
    } else {
      (document as any).body.style.overflowY = 'scroll';
      setHeight(0);
    }
    setMarginTop(visiblePageHeight / 2 + scrollY - 20);
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
