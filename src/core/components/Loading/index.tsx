import { CircularProgress, Grid } from '@mui/material';
import { memo } from 'react';
import { useCalculateMarginTop } from './hooks';

export const Loading = () => {
  const { calculateMarginTop } = useCalculateMarginTop();

  return (
    <Grid container justifyContent='center'>
      <Grid item>
        <CircularProgress style={{ marginTop: calculateMarginTop() }} />
      </Grid>
    </Grid>
  );
};

export default memo(Loading);
