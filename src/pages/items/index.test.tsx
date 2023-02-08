import { expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import {
  render,
  screen,
  waitFor,
  cleanup,
  mockRouterOperation,
  setupUseQueryReturn,
  setupUseInvokeOnce,
  modifyMockedRouter,
  setupUseInvoke,
  act,
  fireEvent,
  mockFilesToDrop,
  setupUseMutationStack,
  setupUseQueryImplementation,
  setupUseInvokeImplementation,
  setupUseMutationImplementation
} from 'test/utils';
import ItemsPage from './index.page';
import NewItemPage from './new.page';
import { ARIA_ROLE } from 'test/ariaRoles';
import EditItemPage from './[itemId]/edit.page';
import * as globalUtils from 'src/utils/global';
import * as fileStorage from 'src/utils/fileStorage';
import { FileType, ItemFile } from 'db';
import { useQuery } from '@blitzjs/rpc';
import getItem from 'src/items/queries/getItem';
import getCategories from 'src/categories/queries/getCategories';
import getItems from 'src/items/queries/getItems';
import { Item } from './[itemId].page';
import * as googleRecaptcha from 'react-google-recaptcha-v3';

// global arrange
const items = [
  {
    id: 1,
    name: 'B-17',
    decription: 'Flying fortress'
  },
  {
    id: 2,
    name: 'B-18',
    decription: 'Flying fortress'
  },
  {
    id: 3,
    name: 'B-19',
    decription: 'Flying fortress'
  },
  {
    id: 4,
    name: 'B-20',
    decription: 'Flying fortress'
  },
  {
    id: 5,
    name: 'B-21',
    decription: 'Flying fortress'
  },
  {
    id: 6,
    name: 'B-22',
    decription: 'Flying fortress'
  },
  {
    id: 7,
    name: 'B-23',
    decription: 'Flying fortress'
  },
  {
    id: 8,
    name: 'B-24',
    decription: 'Flying fortress'
  },
  {
    id: 9,
    name: 'B-25',
    decription: 'Flying fortress'
  },
  {
    id: 10,
    name: 'B-26',
    decription: 'Flying fortress'
  },
  {
    id: 11,
    name: 'B-27',
    decription: 'Flying fortress'
  }
];

describe('Item listing', () => {
  test('Open Item list with items', async () => {
    // arrange
    setupUseInvokeOnce({
      collectionName: 'items',
      items: items.slice(0, 10),
      hasMore: true
    });

    // act
    render(<ItemsPage />);

    // assert
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Item' })).toBeInTheDocument();
    expect(await screen.findByText(items[0]!.name)).toBeInTheDocument();
  });

  test('Open Item list and navigate through pages', async () => {
    // arrange
    const useInvokeCallback = async (_queryFn, params) => {
      switch (params.skip) {
        case 0:
          return {
            items: items.slice(0, 10),
            hasMore: true
          };
        case 10:
          return {
            items: items.slice(10),
            hasMore: false
          };
        default:
          return {
            items: [],
            hasMore: false
          };
      }
    };

    setupUseInvoke(useInvokeCallback);

    let { rerender } = render(<ItemsPage />, {
      router: {
        push: mockRouterOperation((url) => {
          modifyMockedRouter(url);
          rerender(<ItemsPage />);
        }),
        query: { page: '0' }
      }
    });

    expect(await screen.findByText(items[0]!.name)).toBeInTheDocument();

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Next' }));

    // assert
    expect(await screen.findByText(items[10]!.name)).toBeInTheDocument();

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Previous' }));

    // assert
    expect(await screen.findByText(items[0]!.name)).toBeInTheDocument();
  });
});

describe('Item creating', () => {
  test('User create a new item', async () => {
    // arrange
    const categoryTestName = 'category test';

    const item = {
      name: 'name test',
      categoryId: '1',
      description: 'description test',
      dificulty: 1,
      assemblyTime: 0.5,
      files: [],
      author: '',
      authorLink: '',
      licenseType: '',
      licenseTypeLink: '',
      status: 'enable'
    };

    const createItemMutation = vi.fn();

    setupUseMutationImplementation(() => [createItemMutation as any, {} as any]);

    setupUseInvokeImplementation((queryFn: any): any => {
      if (queryFn === getItems) {
        return {
          items: [item]
        };
      } else if (queryFn === getCategories) {
        return {
          categories: [{ id: 1, name: categoryTestName }]
        };
      }
      return {};
    });

    render(<NewItemPage />, {
      router: {
        push: mockRouterOperation(() => {
          cleanup();
          render(<ItemsPage />);
        })
      }
    });

    // act
    const nameTexfield = screen.getByRole(ARIA_ROLE.WIDGET.TEXTBOX, {
      name: 'Name'
    });
    const descriptionTexfield = screen.getByRole(ARIA_ROLE.WIDGET.TEXTBOX, {
      name: 'Description'
    });
    const dificultyTexfield = screen.getByRole(ARIA_ROLE.WIDGET.SPINBUTTON, {
      name: 'Dificulty'
    });
    const assemblyTimeTexfield = screen.getByRole(ARIA_ROLE.WIDGET.SPINBUTTON, {
      name: 'Assembly time'
    });
    const categoryCombobox = screen.getByRole(ARIA_ROLE.WIDGET.COMBOBOX, {
      name: 'Category'
    });

    await userEvent.type(nameTexfield, item.name);
    await userEvent.type(descriptionTexfield, item.description);
    await userEvent.type(dificultyTexfield, item.dificulty.toString());
    await userEvent.type(assemblyTimeTexfield, item.assemblyTime.toString());
    fireEvent.change(categoryCombobox, { target: { value: item.categoryId } });

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Create Item' }));

    // assert
    expect(createItemMutation).toHaveBeenNthCalledWith(1, item);

    await waitFor(() =>
      expect(screen.queryByRole(ARIA_ROLE.STRUCTURE.HEADING, { name: 'Create New Item' })).not.toBeInTheDocument()
    );

    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Item' })).toBeInTheDocument();

    expect(screen.getByText(item.name)).toBeInTheDocument();
  });

  test('User receives an error trying to create an incomplete new item', async () => {
    // arrange
    setupUseInvokeImplementation((queryFn: any): any => {
      if (queryFn === getItems) {
        return {
          items: []
        };
      } else if (queryFn === getCategories) {
        return {
          categories: [{ id: 1, name: 'categ' }]
        };
      }
      return {};
    });

    render(<NewItemPage />, {
      router: {
        push: mockRouterOperation(() => {
          cleanup();
          render(<ItemsPage />);
        })
      }
    });

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Create Item' }));

    // assert
    expect(screen.getByText('Field required and must contain at least 5 characters')).toBeInTheDocument();
    expect(screen.queryByRole(ARIA_ROLE.STRUCTURE.HEADING, { name: 'Create Item' })).not.toBeInTheDocument();
  });
});

describe('Item changing', () => {
  test('User edit an existing item', async () => {
    // arrange
    const initialItem = {
      id: 1,
      name: 'name test',
      description: 'desc test',
      categoryId: 1,
      files: [],
      dificulty: 1,
      assemblyTime: 0.5,
      author: '',
      authorLink: '',
      licenseType: '',
      licenseTypeLink: '',
      status: 'enable'
    };

    const modifiedItem = {
      id: 1,
      name: 'new name test',
      description: 'new desc test',
      categoryId: 1,
      files: []
    };

    const paginatedQueryReturnData = {
      collectionName: 'items',
      items: [initialItem],
      hasMore: false
    };

    setupUseInvokeOnce(paginatedQueryReturnData);

    setupUseQueryReturn(initialItem);

    render(<ItemsPage />, {
      router: {
        push: mockRouterOperation(() => {
          cleanup();
          render(<EditItemPage />);
        })
      }
    });

    // act
    await userEvent.click(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: 'edit' }));

    const nameTexfield = screen.getByRole(ARIA_ROLE.WIDGET.TEXTBOX, {
      name: 'Name'
    });
    const descriptionTexfield = screen.getByRole(ARIA_ROLE.WIDGET.TEXTBOX, {
      name: 'Description'
    });

    expect((nameTexfield as HTMLInputElement).value).toBe(initialItem.name);
    expect((descriptionTexfield as HTMLInputElement).value).toBe(initialItem.description);

    await userEvent.type(nameTexfield, modifiedItem.name);
    await userEvent.type(descriptionTexfield, modifiedItem.description);

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Update Item' }));

    setupUseInvokeOnce({
      ...paginatedQueryReturnData,
      items: [modifiedItem]
    });

    // assert edit
    expect(await screen.findByText('Item successfully updated!')).toBeInTheDocument();

    cleanup();
    render(<ItemsPage />);

    // assert list
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Item' })).toBeInTheDocument();
    expect(await screen.findByText(modifiedItem.name)).toBeInTheDocument();
  });

  test('User list all files of an item', async () => {
    // arrange
    const item = {
      name: 'name test',
      description: 'desc test',
      categoryId: 1,
      files: [
        {
          storagePath: 'vet-clinic.jpg',
          artifactType: 'scheme'
        },
        {
          storagePath: 'jetplane.jpg',
          artifactType: 'scheme'
        }
      ],
      dificulty: 1,
      assemblyTime: 0.5,
      author: '',
      authorLink: '',
      licenseType: '',
      licenseTypeLink: ''
    };
    setupUseQueryReturn(item);

    // act
    render(<EditItemPage />);

    // assert
    const filesContainer = screen.getByRole(ARIA_ROLE.LANDMARK.CONTENTINFO);
    const filesTable = filesContainer.children[1] as HTMLElement;
    const firstLine = filesTable?.children[0]?.children[1] as HTMLElement;
    const secondLine = filesTable?.children[0]?.children[2] as HTMLElement;

    expect(firstLine.innerHTML?.indexOf(item.files[0]?.storagePath as string) > 0).toBeTruthy();
    expect(firstLine.innerHTML?.indexOf(item.files[0]?.artifactType as string) > 0).toBeTruthy();
    expect(secondLine.innerHTML?.indexOf(item.files[1]?.storagePath as string) > 0).toBeTruthy();
    expect(secondLine.innerHTML?.indexOf(item.files[1]?.artifactType as string) > 0).toBeTruthy();
  });

  test('User downloads a file from an item', async () => {
    // arrange
    const item = {
      name: 'name test',
      description: 'desc test',
      categoryId: 1,
      files: [
        {
          storagePath: 'vet-clinic.jpg',
          artifactType: 'SCHEME',
          url: 'http://127.0.0.1/file.png'
        }
      ],
      dificulty: 1,
      assemblyTime: 0.5,
      author: '',
      authorLink: '',
      licenseType: '',
      licenseTypeLink: ''
    };
    setupUseQueryReturn(item);

    render(<EditItemPage />);

    const downloadFile = vi.spyOn(globalUtils, 'downloadFile').mockImplementationOnce((() => {}) as any);

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Download' }));

    // assert
    expect(downloadFile).toHaveBeenNthCalledWith(1, item.files[0]?.storagePath);
  });

  test('User removes a file from an item', async () => {
    // arrange
    window.confirm = vi.fn(() => true);
    vi.mocked(global.fetch).mockResolvedValue({ blob: async () => new Blob([]) } as any);

    const fileStoragePath1 = 'file1.png';
    const fileStoragePath2 = 'file2.png';
    const fileStoragePath3 = 'file3.png';

    const item = {
      id: 1,
      name: 'name test',
      description: 'desc test',
      categoryId: 1,
      dificulty: 1,
      assemblyTime: 0.5,
      author: '',
      authorLink: '',
      licenseType: '',
      licenseTypeLink: '',
      files: [
        {
          id: 1,
          index: 0,
          storagePath: fileStoragePath1,
          artifactType: FileType.scheme,
          url: 'http://127.0.0.1/file.png',
          createdAt: new Date(),
          updatedAt: new Date(),
          itemId: 1
        },
        {
          id: 2,
          index: 1,
          storagePath: fileStoragePath2,
          artifactType: FileType.scheme,
          url: 'http://127.0.0.1/file.png',
          createdAt: new Date(),
          updatedAt: new Date(),
          itemId: 1
        },
        {
          id: 3,
          index: 2,
          storagePath: fileStoragePath3,
          artifactType: FileType.scheme,
          url: 'http://127.0.0.1/file.png',
          createdAt: new Date(),
          updatedAt: new Date(),
          itemId: 1
        }
      ]
    };

    setupUseQueryReturn(item, {
      refetchResolved: {
        ...item,
        files: [...item.files.filter((file) => file.id !== 2)]
      }
    });

    setupUseMutationStack([
      Promise.resolve({}),
      Promise.resolve({
        id: 1,
        storagePath: fileStoragePath1,
        artifactType: FileType.scheme,
        index: 0,
        itemId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      } as ItemFile)
    ]);

    const { rerender } = render(<EditItemPage />);

    // act
    const filesTable = screen.getByText('Files').nextSibling as HTMLTableElement;
    const removeButton = filesTable.rows[2]?.cells[2]?.children[1] as HTMLAnchorElement;
    await userEvent.click(removeButton);

    rerender(<EditItemPage />);

    // assert
    expect(screen.getByText(fileStoragePath1)).toBeInTheDocument();
    expect(screen.queryByText(fileStoragePath2)).not.toBeInTheDocument();
    expect(screen.getByText(fileStoragePath3)).toBeInTheDocument();
  });

  test('User adds a file to an item', async () => {
    // arrange
    global.URL.createObjectURL = vi.fn().mockResolvedValueOnce('http://127.0.0.1');

    const fileName = 'vet-clinic.jpg';

    const filesToBeDroped = mockFilesToDrop([
      {
        name: fileName,
        mimeType: 'image/png',
        blob: []
      }
    ]);

    const item = {
      name: 'name test',
      description: 'desc test',
      categoryId: 1,
      files: [],
      dificulty: 1,
      assemblyTime: 0.5,
      author: '',
      authorLink: '',
      licenseType: '',
      licenseTypeLink: ''
    };

    setupUseQueryImplementation((queryFn: any) => {
      if (queryFn === getItem) {
        const refetch = vi.fn().mockImplementation(() => {
          vi.mocked(useQuery).mockReturnValue([
            {
              ...item,
              files: [
                {
                  storagePath: fileName,
                  artifactType: 'SCHEME',
                  url: 'http://127.0.0.1/file.png'
                }
              ]
            },
            {
              setQueryData: vi.fn(),
              refetch
            } as any
          ]);
        });
        return [item, { refetch } as any];
      } else if (queryFn === getCategories) {
        return [[{ name: 'test' }], {} as any];
      }
      return [];
    });

    render(<EditItemPage />);

    // act
    expect(screen.queryByText(fileName)).not.toBeInTheDocument();

    const dropzoneContainer = screen.getByText('Drag and drop some files here, or click to select files')
      .parentElement as Element;

    await act(() => fireEvent.drop(dropzoneContainer, filesToBeDroped));

    await waitFor(async () => {
      expect(await screen.findByRole(ARIA_ROLE.STRUCTURE.IMG, { name: fileName })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.RADIO, { name: FileType.scheme }));

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Save files' }));

    // assert
    expect(screen.getByText(fileName)).toBeInTheDocument();
  });

  test.todo('User delete an item');
});

describe('Item removing', () => {
  test('User delete an item', async () => {
    // arrange
    const itemName = 'name test item';

    setupUseInvokeOnce({
      collectionName: 'items',
      items: [
        {
          id: 1,
          name: itemName
        }
      ],
      hasMore: false
    });

    window.confirm = vi.fn(() => true);

    render(<ItemsPage />);

    expect(await screen.findByText(itemName)).toBeInTheDocument();

    setupUseInvokeOnce({
      collectionName: 'items',
      items: [],
      hasMore: false
    });

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Delete' }));

    // assert
    expect(screen.queryByText(itemName)).not.toBeInTheDocument();
  });
});

describe('Item viewing', () => {
  test('renders item, main image, thumbnails and table with content information', async () => {
    // arrange
    const item = {
      name: 'name test',
      description: 'desc test',
      categoryId: 1,
      files: [
        {
          artifactType: FileType.thumbnail,
          storagePath: 'abc.jpg'
        },
        {
          artifactType: FileType.preview,
          storagePath: 'abcd.jpg'
        }
      ],
      dificulty: 1,
      assemblyTime: 0.5,
      author: 'Author Name',
      authorLink: '',
      licenseType: 'MIT',
      licenseTypeLink: ''
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob()) } as any);
    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    setupUseInvoke(async () => item);

    // action
    render(<Item />);

    // assert
    expect(await screen.findByText(item.author)).toBeInTheDocument();
    expect(await screen.findByText(`${item.assemblyTime}h`)).toBeInTheDocument();
    expect(await screen.findByText(item.licenseType)).toBeInTheDocument();
  });

  test('renders item and click at download schemes button', async () => {
    // arrange
    const item = {
      name: 'name test',
      description: 'desc test',
      categoryId: 1,
      files: [
        {
          artifactType: FileType.thumbnail,
          storagePath: 'abc.jpg'
        },
        {
          artifactType: FileType.preview,
          storagePath: 'abcd.jpg'
        },
        {
          artifactType: FileType.scheme,
          storagePath: 'abcde.jpg'
        }
      ],
      dificulty: 1,
      assemblyTime: 0.5,
      author: 'Author Name',
      authorLink: '',
      licenseType: 'MIT',
      licenseTypeLink: ''
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob()) } as any);
    vi.spyOn(globalUtils, 'downloadFile');
    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    setupUseInvoke(async () => item);

    render(<Item />);

    // action
    const schemesDownloadButton = screen.getByText('Download schemes');
    expect(schemesDownloadButton).toBeInTheDocument();

    await userEvent.click(schemesDownloadButton);

    // assert
    expect(vi.mocked(globalUtils.downloadFile)).toHaveBeenCalledWith(item.files[2]?.storagePath);
  });

  test('renders item and click at download instrunctions button', async () => {
    // arrange
    const item = {
      name: 'name test',
      description: 'desc test',
      categoryId: 1,
      files: [
        {
          artifactType: FileType.thumbnail,
          storagePath: 'abc.jpg'
        },
        {
          artifactType: FileType.preview,
          storagePath: 'abcd.jpg'
        },
        {
          artifactType: FileType.instruction,
          storagePath: 'abcde.jpg'
        }
      ],
      dificulty: 1,
      assemblyTime: 0.5,
      author: 'Author Name',
      authorLink: '',
      licenseType: 'MIT',
      licenseTypeLink: ''
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob()) } as any);
    vi.spyOn(globalUtils, 'downloadFile');
    vi.spyOn(googleRecaptcha, 'useGoogleReCaptcha').mockReturnValue({
      executeRecaptcha: vi.fn().mockResolvedValue('')
    });

    setupUseInvoke(async () => item);

    render(<Item />);

    // action
    const schemesDownloadButton = screen.getByText('Download instrunctions');
    expect(schemesDownloadButton).toBeInTheDocument();

    await userEvent.click(schemesDownloadButton);

    // assert
    expect(vi.mocked(globalUtils.downloadFile)).toHaveBeenCalledWith(item.files[2]?.storagePath);
  });

  test.skip('renders item, click on a thumbnail and and modify main image', async () => {
    // arrange
    const item = {
      name: 'name test',
      description: 'desc test',
      categoryId: 1,
      files: [
        {
          artifactType: FileType.thumbnail,
          storagePath: 'abc.jpg'
        },
        {
          artifactType: FileType.thumbnail,
          storagePath: 'abcde.jpg'
        },
        {
          artifactType: FileType.preview,
          storagePath: 'abcd.jpg'
        }
      ],
      dificulty: 1,
      assemblyTime: 0.5,
      author: 'Author Name',
      authorLink: '',
      licenseType: 'MIT',
      licenseTypeLink: ''
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({ blob: () => Promise.resolve(new Blob()) } as any);
    // vi.mock('src/utils/fileStorage/getFilePath', () => 'http://localhost:3000/testUrl2');
    vi.spyOn(fileStorage, 'getFilePath').mockResolvedValue('http://localhost:3000/testUrl2');
    // getFilePath  = vi.fn();

    setupUseQueryReturn(item);

    render(<Item />);
    // screen.debug();
    // action

    // userEvent.click()

    // assert
    // expect(await screen.findByText(item.author)).toBeInTheDocument();
    // expect(await screen.findByText(`${item.assemblyTime}h`)).toBeInTheDocument();
    // expect(await screen.findByText(item.licenseType)).toBeInTheDocument();
  });
});
