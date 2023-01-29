import { CircularProgress, Grid, Link, Paper } from '@mui/material';
import { memo } from 'react';
import { IThumbnailProps } from './types';

export const Thumbnail = (props: IThumbnailProps) => {
  let className = props.className ? props.className : '';
  const hasClickEvent = !!props.onClick;
  className += hasClickEvent ? ' thumbnail-clickable' : '';
  const handleClick = (index: number) => {
    if (hasClickEvent) {
      props.onClick!(index);
    }
  };
  return (
    <Link onClick={() => handleClick(props.index)}>
      <Paper variant='outlined' elevation={0} className={className}>
        <Grid container>
          <Grid item>
            {props.src ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={props.src} width='100' height='100' alt={props.altText} />
            ) : (
              <CircularProgress />
            )}
          </Grid>
          <Grid item>{props.children}</Grid>
        </Grid>
      </Paper>
    </Link>
  );
};

export default memo(Thumbnail);
