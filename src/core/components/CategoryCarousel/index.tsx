import { memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import { CategoryCarouselProps } from './types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { getSimpleRandomKey } from 'src/utils/global';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const renderItem = (category: any, onClickSlide: Function) => (
  <SwiperSlide key={getSimpleRandomKey()} onClick={() => onClickSlide(category.id)}>
    <Grid container alignItems='center' justifyContent='center' style={{ height: '100%' }}>
      <Grid item xs={12}>
        {/* eslint-disable-next-line @next/next/no-img-element*/}
        <img src={category.imagePath} alt={category.name} />
      </Grid>
      <Grid item xs={12}>
        <Typography component='p' variant='h6' className='category-carousel-title'>
          {category.name}
        </Typography>
      </Grid>
    </Grid>
  </SwiperSlide>
);

const renderLoadingItem = () =>
  [1, 2, 3].map((_i) => (
    <SwiperSlide key={getSimpleRandomKey()}>
      <CircularProgress />
    </SwiperSlide>
  ));

export const CategoryCarousel = ({ categories, loading = false, onClickSlide }: CategoryCarouselProps) => {
  return (
    <Swiper slidesPerView={3} spaceBetween={12} navigation={true} modules={[Navigation]}>
      {loading ? renderLoadingItem() : categories.map((category) => renderItem(category, onClickSlide))}
    </Swiper>
  );
};

export default memo(CategoryCarousel);
