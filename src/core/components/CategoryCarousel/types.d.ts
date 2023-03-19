import { Category } from 'db';

export type CategoryCarouselProps = {
  categories: Category[];
  loading?: boolean;
  onClickSlide: (categoryId: number) => void;
};
