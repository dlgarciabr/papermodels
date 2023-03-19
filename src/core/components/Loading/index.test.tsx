import Loading from './index';
import { render, screen } from 'test/utils';

describe('Loading component', async () => {
  test('renders the circular progress', () => {
    render(<Loading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
