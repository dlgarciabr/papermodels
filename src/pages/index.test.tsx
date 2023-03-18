import userEvent from '@testing-library/user-event';
import { ARIA_ROLE } from 'src/utils/ariaRoles';
import { render, screen, setupUseInvokeImplementation, setupUseInvokeOnce } from 'test/utils';
import { vi } from 'vitest';
import * as googleRecaptcha from 'react-google-recaptcha-v3';
import Home from './index.page';
import { FileType } from '@prisma/client';

describe('Index page tests', () => {
  test('Index page is rendered', () => {
    // arrange
    setupUseInvokeOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: 'test'
        }
      ],
      hasMore: false
    });

    // act
    const result = render(<Home />);

    // assert
    expect(result.baseElement).toMatchSnapshot();
  });

  test('Index page renders the search input and submit button', () => {
    // arrange
    setupUseInvokeOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: 'test'
        }
      ],
      hasMore: false
    });

    // act
    render(<Home />);

    const searchInput = screen.getByLabelText('Search for a model');
    const submitButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search for a model' });

    // assert
    expect(searchInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  test('User search for a model pressing a search button and see results', async () => {
    // arrange
    const textToSearch = 'Train';

    let callIndex = 0;
    setupUseInvokeImplementation((_queryFn: any): any => {
      const returnStack = [
        {
          collectionName: 'categories',
          categories: [
            {
              id: 1,
              name: 'test'
            }
          ]
        },
        {
          collectionName: 'items',
          items: [
            {
              id: 1,
              name: 'Train',
              files: [
                {
                  storagePath: 'vet-clinic.jpg',
                  artifactType: FileType.preview,
                  mainPreview: true
                },
                {
                  storagePath: 'jetplane.jpg',
                  artifactType: FileType.scheme
                }
              ]
            }
          ],
          hasMore: true
        }
      ];
      const data = returnStack[callIndex];
      callIndex++;
      return data;
    });

    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search for a model');
    const searchButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search for a model' });

    await userEvent.type(searchInput, textToSearch);
    await userEvent.click(searchButton);

    // assert
    expect(await screen.findByText(textToSearch)).toBeInTheDocument();
  });

  test('User search for a model pressing enter and see results', async () => {
    // arrange
    const textToSearch = 'Train';

    let callIndex = 0;
    setupUseInvokeImplementation((_queryFn: any): any => {
      const returnStack = [
        {
          collectionName: 'categories',
          categories: [
            {
              id: 1,
              name: 'test'
            }
          ]
        },
        {
          collectionName: 'items',
          items: [
            {
              id: 1,
              name: 'Train',
              files: [
                {
                  storagePath: 'vet-clinic.jpg',
                  artifactType: FileType.preview,
                  mainPreview: true
                },
                {
                  storagePath: 'jetplane.jpg',
                  artifactType: FileType.scheme
                }
              ]
            }
          ],
          hasMore: true
        }
      ];
      const data = returnStack[callIndex];
      callIndex++;
      return data;
    });

    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search for a model');

    await userEvent.type(searchInput, textToSearch);
    await userEvent.type(searchInput, '{enter}');

    // assert
    expect(await screen.findByText(textToSearch)).toBeInTheDocument();
  });

  test('User search for a model and see random results', async () => {
    // arrange
    const textToSearch = 'Train';

    let callIndex = 0;
    setupUseInvokeImplementation((_queryFn: any): any => {
      const returnStack = [
        {
          collectionName: 'categories',
          categories: [
            {
              id: 1,
              name: 'test'
            }
          ]
        },
        {
          collectionName: 'items',
          items: [],
          hasMore: false
        },
        5,
        {
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
        }
      ];
      const data = returnStack[callIndex];
      callIndex++;
      return data;
    });

    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search for a model');
    const searchButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search for a model' });

    await userEvent.type(searchInput, textToSearch);
    await userEvent.click(searchButton);

    // assert
    expect(await screen.findByText(textToSearch)).toBeInTheDocument();
  });

  test('User cleans the search when the X icon button is clicked', async () => {
    // arrange
    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    setupUseInvokeOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: 'test'
        }
      ],
      hasMore: false
    });

    render(<Home />);
    const searchInput = screen.getByLabelText('Search for a model');
    await userEvent.type(searchInput, 'test');

    // act
    const cleanButton = screen.getByTitle('Clean');
    await userEvent.click(cleanButton);

    // assert
    expect((searchInput as HTMLInputElement).value).toBe('');
  });

  test('User tries to search with empty input field and see a warning message', async () => {
    // arrange
    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    setupUseInvokeOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: 'test'
        }
      ],
      hasMore: false
    });

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search for a model');

    await userEvent.type(searchInput, '{enter}');

    // assert
    expect(await screen.findByText('Type something before search, like aircraft...')).toBeInTheDocument();
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

  test('Show error toast if Google recaptcha is not available', async () => {
    // arrange
    const textToSearch = 'Train';

    let callIndex = 0;
    setupUseInvokeImplementation((_queryFn: any): any => {
      const returnStack = [
        {
          collectionName: 'categories',
          categories: [
            {
              id: 1,
              name: 'test'
            }
          ]
        },
        {
          collectionName: 'items',
          items: [
            {
              id: 1,
              name: 'Train',
              files: []
            }
          ],
          hasMore: true
        }
      ];
      const data = returnStack[callIndex];
      callIndex++;
      return data;
    });

    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: undefined
    });

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search for a model');
    const searchButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search for a model' });

    await userEvent.type(searchInput, textToSearch);
    await userEvent.click(searchButton);

    // assert
    expect(await screen.findByText('Execute recaptcha not yet available')).toBeInTheDocument();
  });
});
