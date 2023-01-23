import userEvent from '@testing-library/user-event';
import { ARIA_ROLE } from 'test/ariaRoles';
import { render, screen, setupUseInvokeOnce } from 'test/utils';
import Home from './index.page';

describe('Index page tests', () => {
  test('Index page is rendered', () => {
    // arrange

    // act
    const result = render(<Home />);

    // assert
    expect(result.baseElement).toMatchSnapshot();
  });

  test('Index page renders the search input and submit button', () => {
    // arrange

    // act
    render(<Home />);

    const searchInput = screen.getByLabelText('Search on Papermodels');
    const submitButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search' });

    // assert
    expect(searchInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  test('User search for a model pressing a search button and see results', async () => {
    // arrange
    const textToSearch = 'Train';

    setupUseInvokeOnce({
      collectionName: 'items',
      items: [
        {
          id: 1,
          name: 'Train',
          files: []
        }
      ],
      hasMore: true
    });

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search on Papermodels');
    const searchButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search' });

    await userEvent.type(searchInput, textToSearch);
    await userEvent.click(searchButton);

    // assert
    expect(await screen.findByText(textToSearch)).toBeInTheDocument();
  });

  test('User search for a model pressing enter and see results', async () => {
    // arrange
    const textToSearch = 'Train';

    setupUseInvokeOnce({
      collectionName: 'items',
      items: [
        {
          id: 1,
          name: 'Train',
          files: []
        }
      ],
      hasMore: true
    });

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search on Papermodels');

    await userEvent.type(searchInput, textToSearch);
    await userEvent.type(searchInput, '{enter}');

    // assert
    expect(await screen.findByText(textToSearch)).toBeInTheDocument();
  });

  test('User cleans the search when the X icon button is clicked', async () => {
    // arrange
    render(<Home />);
    const searchInput = screen.getByLabelText('Search on Papermodels');
    await userEvent.type(searchInput, 'test');

    // act
    const cleanButton = screen.getByTitle('Clean');
    await userEvent.click(cleanButton);

    // assert
    expect((searchInput as HTMLInputElement).value).toBe('');
  });

  test.todo('User search for a model and see no results');

  test.todo('User search for a specific model and navigate to see the chosen model');

  test.todo('User search for a specific model and navigate through pages');
});
