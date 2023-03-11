import { vi } from 'vitest';
import Loading from './index';
import { render, screen } from 'test/utils';
import * as hooks from './hooks';

describe('Loading component', async () => {
  test('renders the circular progress', () => {
    render(<Loading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('applies the calculated margin top to the circular progress', () => {
    //arrange
    vi.spyOn(hooks, 'useCalculateMarginTop').mockReturnValue({ calculateMarginTop: vi.fn(() => '10px') });

    //act
    render(<Loading />);

    //assert
    expect(screen.getByRole('progressbar')).toHaveStyle('margin-top: 10px');

    vi.clearAllMocks();
  });
});
