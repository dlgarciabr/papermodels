import { expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import {
  render,
  screen,
  waitFor,
  cleanup,
  setupUsePaginatedQueryOnce,
  mockRouterOperation,
  setupUseQueryReturn,
  setupUseMutationOnce,
  setupUseInvokeOnce,
  modifyMockedRouter,
  setupUseInvoke,
  act,
  fireEvent,
  mockFilesToDrop,
  setupUseMutationStack,
  setupUseQueryImplementation,
  setupUseInvokeImplementation,
  setupUseMutation
} from 'test/utils';
import ItemsPage from './index.page';
import NewItemPage from './new.page';
import { ARIA_ROLE } from 'test/ariaRoles';
import EditItemPage from './[itemId]/edit.page';
import * as globalUtils from 'src/utils/global';
import { FileType, Item, ItemFile } from 'db';
import { useQuery } from '@blitzjs/rpc';
import getItem from 'src/items/queries/getItem';
import getCategories from 'src/categories/queries/getCategories';
import getItems from 'src/items/queries/getItems';
import { typeToFlattenedError, ZodError, ZodFormattedError, ZodIssue } from 'zod';

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
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: items[0]?.name })).toBeInTheDocument();
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

    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: items[0]?.name })).toBeInTheDocument();

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Next' }));

    // assert
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: items[10]?.name })).toBeInTheDocument();

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Previous' }));

    // assert
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: items[0]?.name })).toBeInTheDocument();
  });
});

describe('Item creating', () => {
  test('User create a new item', async () => {
    // arrange
    const itemName = 'name test';
    const categoryTestName = 'category test';

    setupUseInvokeImplementation((queryFn: any): any => {
      if (queryFn === getItems) {
        return {
          items: [{ id: 1, name: itemName }]
        };
      } else if (queryFn === getCategories) {
        return {
          categories: [{ id: 1, name: categoryTestName }]
        };
      }
      return {};
    });

    // setupUseQueryReturn({ categories: [{ id: 1, name: 'test' }] });

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
    const categoryCombobox = screen.getByRole(ARIA_ROLE.WIDGET.COMBOBOX, {
      name: 'Category'
    });

    await userEvent.type(nameTexfield, itemName);
    await userEvent.type(descriptionTexfield, 'description test');
    await userEvent.selectOptions(categoryCombobox, '1');

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Create Item' }));

    // assert
    await waitFor(() =>
      expect(screen.queryByRole(ARIA_ROLE.STRUCTURE.HEADING, { name: 'Create New Item' })).not.toBeInTheDocument()
    );

    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Item' })).toBeInTheDocument();

    expect(screen.getByText(itemName)).toBeInTheDocument();
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
    expect(screen.getByText('String must contain at least 5 character(s)')).toBeInTheDocument();
    expect(screen.queryByRole(ARIA_ROLE.STRUCTURE.HEADING, { name: 'Create Item' })).not.toBeInTheDocument();
  });
});

describe('Item changing', () => {
  test('User edit an existing item', async () => {
    // arrange
    const initialItem = {
      name: 'name test',
      description: 'desc test',
      files: []
    };

    const modifiedItem = {
      name: 'new name test',
      description: 'new desc test',
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
    cleanup();
    render(<ItemsPage />);

    // assert
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Item' })).toBeInTheDocument();
    expect(await screen.findByText(modifiedItem.name)).toBeInTheDocument();
  });

  test('User list all files of an item', async () => {
    // arrange
    const item = {
      name: 'name test',
      description: 'desc test',
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
      files: [
        {
          storagePath: 'vet-clinic.jpg',
          artifactType: 'SCHEME',
          url: 'http://127.0.0.1/file.png'
        }
      ]
    };
    setupUseQueryReturn(item);

    render(<EditItemPage />);

    const downloadFile = vi.spyOn(globalUtils, 'downloadFile').mockImplementationOnce((() => {}) as any);

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Download' }));

    // assert
    expect(downloadFile).toHaveBeenNthCalledWith(1, item.files[0]);
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
      createdAt: new Date(),
      updatedAt: new Date(),
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
        blob: [' ']
      }
    ]);

    const item = {
      name: 'name test',
      description: 'desc test',
      files: []
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

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.RADIO, { name: FileType.instruction }));

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
