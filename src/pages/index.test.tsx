import userEvent from '@testing-library/user-event';
import { ARIA_ROLE } from 'src/utils/ariaRoles';
import { fireEvent, render, screen, setupUseInvokeImplementation, setupUseInvokeOnce, waitFor } from 'test/utils';
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

  test.todo('User search for a model and see no results');

  test.todo('User search for a specific model and navigate to see the chosen model');

  test('User search for a specific model and navigate through pages', async () => {
    // arrange
    const textToSearch = 'Train';

    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

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
            },
            {
              id: 1,
              name: 'Train2',
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
            },
            {
              id: 1,
              name: 'Train3',
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
            },
            {
              id: 1,
              name: 'Train4',
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
            },
            {
              id: 1,
              name: 'Train5',
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
            },
            {
              id: 1,
              name: 'Train6',
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
            },
            {
              id: 1,
              name: 'Train7',
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
            },
            {
              id: 1,
              name: 'Train8',
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
            },
            {
              id: 1,
              name: 'Train9',
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
        },
        {
          collectionName: 'items',
          items: [
            {
              id: 1,
              name: 'Train10',
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
          hasMore: false
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
                  artifactType: 'scheme'
                },
                {
                  storagePath: 'jetplane.jpg',
                  artifactType: 'scheme'
                }
              ]
            },
            {
              id: 1,
              name: 'Train2',
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
            },
            {
              id: 1,
              name: 'Train3',
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
            },
            {
              id: 1,
              name: 'Train4',
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
            },
            {
              id: 1,
              name: 'Train5',
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
            },
            {
              id: 1,
              name: 'Train6',
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
            },
            {
              id: 1,
              name: 'Train7',
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
            },
            {
              id: 1,
              name: 'Train8',
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
            },
            {
              id: 1,
              name: 'Train9',
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

    render(<Home />);

    // act
    const searchInput = screen.getByLabelText('Search for a model');
    const searchButton = screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Search for a model' });

    await userEvent.type(searchInput, textToSearch);
    await userEvent.click(searchButton);

    // assert
    expect(await screen.findByText('Train')).toBeInTheDocument();

    // act to next
    const nextButton = await screen.findByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Go to next page' });
    await userEvent.click(nextButton);

    // assert next
    expect(await screen.findByText('Train10')).toBeInTheDocument();

    // act to prev
    const prevButton = await screen.findByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Go to previous page' });
    await userEvent.click(prevButton);

    // assert prev
    expect(await screen.findByText('Train')).toBeInTheDocument();
  });

  test('User clicks on a specific category see models and navigate through pages', async () => {
    // arrange
    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    let callIndex = 0;
    setupUseInvokeImplementation((_queryFn: any): any => {
      const returnStack = [
        {
          collectionName: 'categories',
          categories: [
            {
              id: 1,
              name: 'automobiles'
            },
            {
              id: 2,
              name: 'aircrafts'
            },
            {
              id: 3,
              name: 'buses'
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
                  artifactType: 'scheme'
                },
                {
                  storagePath: 'jetplane.jpg',
                  artifactType: 'scheme'
                }
              ]
            },
            {
              id: 1,
              name: 'Train2',
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
            },
            {
              id: 1,
              name: 'Train3',
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
            },
            {
              id: 1,
              name: 'Train4',
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
            },
            {
              id: 1,
              name: 'Train5',
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
            },
            {
              id: 1,
              name: 'Train6',
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
            },
            {
              id: 1,
              name: 'Train7',
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
            },
            {
              id: 1,
              name: 'Train8',
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
            },
            {
              id: 1,
              name: 'Train9',
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
        },
        {
          collectionName: 'items',
          items: [
            {
              id: 1,
              name: 'Train10',
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
          hasMore: false
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
                  artifactType: 'scheme'
                },
                {
                  storagePath: 'jetplane.jpg',
                  artifactType: 'scheme'
                }
              ]
            },
            {
              id: 1,
              name: 'Train2',
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
            },
            {
              id: 1,
              name: 'Train3',
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
            },
            {
              id: 1,
              name: 'Train4',
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
            },
            {
              id: 1,
              name: 'Train5',
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
            },
            {
              id: 1,
              name: 'Train6',
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
            },
            {
              id: 1,
              name: 'Train7',
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
            },
            {
              id: 1,
              name: 'Train8',
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
            },
            {
              id: 1,
              name: 'Train9',
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

    const { container } = render(<Home />);

    // act
    const slides = container.querySelectorAll('.swiper-slide');

    expect(slides).toHaveLength(3);

    await waitFor(() => {
      expect(slides[0]?.querySelector('circle')).not.toBeInTheDocument();
    });

    const categorySlide = screen.getByRole(ARIA_ROLE.STRUCTURE.IMG, { name: 'automobiles' });

    fireEvent.click(categorySlide);

    // assert view category slide
    const loading = container.querySelector('.loading');

    await waitFor(() => {
      expect((loading as any).style.display).toBe('flex');
    });

    await waitFor(() => {
      expect((loading as any).style.display).toBe('none');
    });

    expect(await screen.findByText('Train')).toBeInTheDocument();

    // act to next
    const nextButton = await screen.findByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Go to next page' });
    await userEvent.click(nextButton);

    // assert next
    expect(await screen.findByText('Train10')).toBeInTheDocument();

    // act to prev
    const prevButton = await screen.findByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Go to previous page' });
    await userEvent.click(prevButton);

    // assert prev
    expect(await screen.findByText('Train')).toBeInTheDocument();
  });

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
