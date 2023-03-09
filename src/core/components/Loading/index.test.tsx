import { render } from '@testing-library/react';
import { vi } from 'vitest';
import Loading from './index';
import * as hooks from './hooks';

describe('Loading component', async () => {
  test('renders the circular progress', () => {
    const { getByRole } = render(<Loading />);
    expect(getByRole('progressbar')).toBeInTheDocument();
  });

  test('applies the calculated margin top to the circular progress', () => {
    //arrange
    vi.spyOn(hooks, 'useCalculateMarginTop').mockReturnValue(vi.fn(() => '10px'));

    //act
    const { getByRole } = render(<Loading />);

    //assert
    expect(getByRole('progressbar')).toHaveStyle('margin-top: 10px');
  });
});
