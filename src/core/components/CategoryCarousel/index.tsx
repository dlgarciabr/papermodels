import { memo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper';
import { CategoryCarouselProps } from './types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { getSimpleRandomKey } from 'src/utils/global';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const renderItem = (category: any) => (
  <SwiperSlide key={getSimpleRandomKey()}>
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element*/}
      <img src={category.imagePath} alt={category.name} />
      <Typography component='p' variant='h6' className='category-carousel title'>
        {category.name}
      </Typography>
    </div>
  </SwiperSlide>
);

const renderLoadingItem = () =>
  [1, 2, 3].map((_i) => (
    <SwiperSlide key={getSimpleRandomKey()}>
      <CircularProgress />
    </SwiperSlide>
  ));

export const CategoryCarousel = ({ categories, loading = false }: CategoryCarouselProps) => {
  return (
    <Swiper
      slidesPerView={3}
      spaceBetween={12}
      pagination={{
        clickable: true
      }}
      navigation={true}
      modules={[Pagination, Navigation]}>
      {loading ? renderLoadingItem() : categories.map((category) => renderItem(category))}
    </Swiper>
  );
};

export default memo(CategoryCarousel);
