import { expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import {
  render,
  screen,
  waitFor,
  cleanup,
  setupUsePaginatedQueryOnce,
  mockRouterOperation,
  setupUseQuery,
  setupUseMutationOnce,
  setupUseInvokeOnce,
  modifyMockedRouter
} from 'test/utils';
import ItemsPage from '.';
import NewItemPage from './new';
import { ISetupUsePaginatedQuery } from 'test/types';
import { ARIA_ROLE } from 'test/ariaRoles';
import EditItemPage from './[itemId]/edit';
import * as globalUtils from 'src/utils/global';

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

vi.mock('src/items/queries/getItems', () => {
  const resolver = vi.fn() as any;
  resolver._resolverType = 'query';
  resolver._routePath = '/api/rpc/getItems';
  return { default: resolver };
});

vi.mock('src/items/mutations/createItem', () => {
  const resolver = vi.fn() as any;
  resolver._resolverType = 'query';
  resolver._routePath = '/api/rpc/createItem';
  return { default: resolver };
});

const globalUsePaginatedQueryParams: ISetupUsePaginatedQuery = {
  collectionName: 'items',
  items: items.slice(0, 10),
  hasMore: true
};

describe('Item', () => {
  test('Open Item list with items', async () => {
    // arrange
    setupUseInvokeOnce(globalUsePaginatedQueryParams);

    // act
    render(<ItemsPage />);

    // assert
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Item' })).toBeInTheDocument();
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: items[0]?.name })).toBeInTheDocument();
  });

  test('Open Item list and navigate through pages', async () => {
    // arrange
    setupUseInvokeOnce(globalUsePaginatedQueryParams);

    const { rerender } = render(<ItemsPage />, {
      router: {
        push: mockRouterOperation(() => {
          modifyMockedRouter({ query: { page: '1' } });
          rerender(<ItemsPage />);
        })
      }
    });

    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: items[0]?.name })).toBeInTheDocument();

    setupUseInvokeOnce({
      ...globalUsePaginatedQueryParams,
      items: items.slice(10),
      hasMore: false
    });

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Next' }));

    // assert
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: items[10]?.name })).toBeInTheDocument();
  });
});

describe('Item creating', () => {
  test('User create a new item', async () => {
    // arrange
    const itemName = 'name test';

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
    const categoryTexfield = screen.getByRole(ARIA_ROLE.WIDGET.TEXTBOX, {
      name: 'categoryId'
    });

    await userEvent.type(nameTexfield, itemName);
    await userEvent.type(descriptionTexfield, 'description test');
    await userEvent.type(categoryTexfield, '1');

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
    const itemName = 'name test';

    const error = {
      code: 'invalid_type',
      expected: 'string',
      received: 'undefined',
      path: ['name'],
      message: 'Required'
    };

    const createItemMutation = vi.fn().mockRejectedValueOnce(error);
    setupUseMutationOnce(createItemMutation as any);

    setupUsePaginatedQueryOnce({
      collectionName: 'items',
      items: [
        {
          id: 1,
          name: itemName
        }
      ],
      hasMore: false
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
    expect(screen.getByRole(ARIA_ROLE.STRUCTURE.HEADING, { name: 'Create New Item' })).toBeInTheDocument();
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

    setupUseQuery(initialItem);

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
          id: 'vet-clinic.jpg',
          type: 'SCHEME'
        },
        {
          id: 'jetplane.jpg',
          type: 'SCHEME'
        }
      ]
    };
    setupUseQuery(item);

    // act
    render(<EditItemPage />);

    // assert
    const filesContainer = screen.getByRole(ARIA_ROLE.LANDMARK.CONTENTINFO);
    const filesTable = filesContainer.children[1] as HTMLElement;
    const firstLine = filesTable?.children[1] as HTMLElement;
    const secondLine = filesTable?.children[2] as HTMLElement;
    expect(firstLine.innerHTML?.indexOf(item.files[0]?.id as string) > 0).toBeTruthy();
    expect(firstLine.innerHTML?.indexOf(item.files[0]?.type as string) > 0).toBeTruthy();
    expect(secondLine.innerHTML?.indexOf(item.files[1]?.id as string) > 0).toBeTruthy();
    expect(secondLine.innerHTML?.indexOf(item.files[1]?.type as string) > 0).toBeTruthy();
  });

  test('User download a file from an item', async () => {
    // arrange
    const item = {
      name: 'name test',
      description: 'desc test',
      files: [
        {
          id: 'vet-clinic.jpg',
          type: 'SCHEME',
          url: 'http://127.0.0.1/file.png'
        }
      ]
    };
    setupUseQuery(item);

    render(<EditItemPage />);

    const downloadFile = vi.spyOn(globalUtils, 'downloadFile').mockImplementationOnce((() => {}) as any);

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Download' }));

    // assert
    expect(downloadFile).toHaveBeenNthCalledWith(1, item.files[0]?.id, item.files[0]?.url);
  });

  test.todo('User add an image file to an item', async () => {});

  test.todo('User add a pdf file to an item', async () => {});

  test.todo('User remove a file from an item', async () => {});

  test.todo('User delete an item');
});
