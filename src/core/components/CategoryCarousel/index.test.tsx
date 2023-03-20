import { expect, vi } from 'vitest';

import { fireEvent, render, screen } from 'test/utils';
import CategoryCarousel from '.';
import { Category } from '@prisma/client';

describe('CategoryCarousel', () => {
  // global arrange
  const categories = [
    {
      id: 1,
      imagePath: 'category1.png',
      name: 'Category 1'
    },
    {
      id: 2,
      imagePath: 'category2.png',
      name: 'Category 2'
    }
  ] as unknown as Category[];

  test('renders category carousel with loading indicator', () => {
    //act
    render(<CategoryCarousel loading={true} categories={[]} onClickSlide={() => {}} />);

    //assert
    const loadingIndicators = screen.getAllByRole('progressbar');
    expect(loadingIndicators.length).toBe(3); // Three loading indicators are rendered
  });

  test('renders category carousel without loading indicator', () => {
    //act
    render(<CategoryCarousel categories={categories} onClickSlide={() => {}} />);

    //assert
    const categoryNames = screen.getAllByText(/Category/);
    expect(categoryNames.length).toBe(categories.length); // The correct number of category names are rendered
  });

  test('calls onClickSlide when a slide is clicked', async () => {
    const onClickSlide = vi.fn();

    //act 1
    const { container } = render(<CategoryCarousel categories={categories} onClickSlide={onClickSlide} />);
    const slides = container.getElementsByClassName('swiper-slide');

    //assert 1
    expect(slides).toHaveLength(2);
    expect(slides[0]).not.toBeUndefined();

    //act 2
    fireEvent.click(slides[0]!);

    //assert 2
    expect(onClickSlide).toHaveBeenCalledWith(categories[0]!.id); // onClickSlide is called with the correct category ID
  });
});
