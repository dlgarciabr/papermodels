import userEvent from '@testing-library/user-event';
import { ARIA_ROLE } from 'test/ariaRoles';
import { render, screen, setupUseInvokeOnce } from 'test/utils';
import { vi } from 'vitest';
import * as googleRecaptcha from 'react-google-recaptcha-v3';
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
    const submitButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search for a model' });

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
          files: [
            {
              storagePath: 'vet-clinic.jpg',
              artifactType: 'scheme'
            },
            {
              storagePath: 'jetplane.jpg',
              artifactType: 'scheme'
            }
          ]
        }
      ],
      hasMore: true
    });

    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search on Papermodels');
    const searchButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search for a model' });

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
          files: [
            {
              storagePath: 'vet-clinic.jpg',
              artifactType: 'scheme',
              mainPreview: true
            },
            {
              storagePath: 'jetplane.jpg',
              artifactType: 'scheme'
            }
          ]
        }
      ],
      hasMore: true
    });

    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
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
    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    render(<Home />);
    const searchInput = screen.getByLabelText('Search on Papermodels');
    await userEvent.type(searchInput, 'test');

    // act
    const cleanButton = screen.getByTitle('Clean');
    await userEvent.click(cleanButton);

    // assert
    expect((searchInput as HTMLInputElement).value).toBe('');
  });

  test.todo('renders a SearchCard component for each item in the data.items array', () => {
    // arrange
    // const items = [
    //   { name: 'Item 1', description: 'Description 1' },
    //   { name: 'Item 2', description: 'Description 2' }
    // ];
    // // vi.spyOn()
    // vi.mock('src/pages/index.hooks', () => ({
    //   useSearch: () => ({ items, count: 2 })
    // }));
    // // vi.mock(useSearch).mockReturnValue({ items, count: 2 });
    // render(<Home />);
    // const searchCards = screen.getAllByTestId('search-card');
    // expect(searchCards.length).toBe(2);
    // expect(screen.getByText('Item 1')).toBeInTheDocument();
    // expect(screen.getByText('Description 1')).toBeInTheDocument();
    // expect(screen.getByText('Item 2')).toBeInTheDocument();
    // expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  test.todo('User search for a model and see no results');

  test.todo('User search for a specific model and navigate to see the chosen model');

  test.todo('User search for a specific model and navigate through pages');

  test('Google recaptcha is not available', async () => {
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

    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: undefined
    });

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search on Papermodels');
    const searchButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search for a model' });

    await userEvent.type(searchInput, textToSearch);
    await userEvent.click(searchButton);

    // assert
    expect(await screen.findByText('Execute recaptcha not yet available')).toBeInTheDocument();
  });
});
