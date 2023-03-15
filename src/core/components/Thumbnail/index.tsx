import { CircularProgress, Grid, Link, Paper } from '@mui/material';
import { memo } from 'react';
import { IThumbnailProps } from './types';

export const Thumbnail = (props: IThumbnailProps) => {
  const hasClickEvent = !!props.onClick;
  let classNames = props.className ? ` ${props.className}` : '';
  classNames += hasClickEvent ? ' thumbnail-clickable' : '';
  const handleClick = (index: number) => {
    if (hasClickEvent) {
      props.onClick!(index);
    }
  };
  return (
    <Link onClick={() => handleClick(props.index)}>
      <Paper variant='outlined' elevation={0} className={classNames}>
        <Grid container justifyContent='center'>
          <Grid item container className='height100px' alignItems='center' justifyContent='center'>
            {props.loading ? (
              <CircularProgress />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={props.src} width='100' height='100' alt={props.altText} />
            )}
          </Grid>
          <Grid item>{props.children}</Grid>
        </Grid>
      </Paper>
    </Link>
  );
};

export default memo(Thumbnail);
