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
  setupUseMutationOnce
} from 'test/utils';
import ItemsPage from '.';
import NewItemPage from './new';
import { ISetupUsePaginatedQuery } from 'test/types';
import { ARIA_ROLE } from 'test/ariaRoles';
import EditItemPage from './[itemId]/edit';

// global arrange
const items = [
  {
    id: 1,
    name: 'B-17',
    decription: 'Flying fortress'
  }
];

const categories = [
  {
    id: 1,
    name: 'Airplanes'
  },
  {
    id: 2,
    name: 'Cars'
  },
  {
    id: 3,
    name: 'Houses'
  },
  {
    id: 4,
    name: 'Animals'
  },
  {
    id: 5,
    name: 'Trains'
  },
  {
    id: 6,
    name: 'Emergency places'
  },
  {
    id: 7,
    name: 'Boats&Ships'
  },
  {
    id: 8,
    name: 'Stores'
  },
  {
    id: 9,
    name: 'Service building'
  },
  {
    id: 10,
    name: 'Plants'
  },
  {
    id: 11,
    name: 'Miscelaneus'
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
  test('Open Item list with items', () => {
    // arrange
    setupUsePaginatedQueryOnce(globalUsePaginatedQueryParams);

    // act
    render(<ItemsPage />);

    // assert
    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Item' })).toBeInTheDocument();
    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: items[0]?.name })).toBeInTheDocument();
  });

  test('Open Item list and navigate through pages', async () => {
    // arrange
    setupUsePaginatedQueryOnce(globalUsePaginatedQueryParams);

    const { rerender } = render(<ItemsPage />, {
      router: {
        push: mockRouterOperation(() => rerender(<ItemsPage />))
      }
    });

    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: items[0]?.name })).toBeInTheDocument();

    setupUsePaginatedQueryOnce({
      ...globalUsePaginatedQueryParams,
      items: items.slice(10),
      hasMore: false
    });

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Next' }));

    // assert
    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: items[10]?.name })).toBeInTheDocument();
  });
});

describe('Item creating', () => {
  test('User create a new item', async () => {
    // arrange
    const itemName = 'name test';

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
    const itemName = 'name test';
    const itemDescription = 'desc test';

    const itemNewName = 'new name test';
    const itemNewDescription = 'new desc test';

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

    setupUseQuery({ name: itemName, description: itemDescription });

    render(<ItemsPage />, {
      router: {
        push: mockRouterOperation(() => {
          cleanup();
          render(<EditItemPage />);
        })
      }
    });

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'edit' }));

    const nameTexfield = screen.getByRole(ARIA_ROLE.WIDGET.TEXTBOX, {
      name: 'Name'
    });
    const descriptionTexfield = screen.getByRole(ARIA_ROLE.WIDGET.TEXTBOX, {
      name: 'Description'
    });

    expect((nameTexfield as HTMLInputElement).value).toBe(itemName);
    expect((descriptionTexfield as HTMLInputElement).value).toBe(itemDescription);

    await userEvent.type(nameTexfield, itemNewName);
    await userEvent.type(descriptionTexfield, itemNewDescription);

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Update Item' }));

    setupUsePaginatedQueryOnce({
      collectionName: 'items',
      items: [
        {
          id: 1,
          name: itemNewName
        }
      ],
      hasMore: false
    });
    cleanup();
    render(<ItemsPage />);
    // assert

    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Item' })).toBeInTheDocument();

    expect(screen.getByText(itemNewName)).toBeInTheDocument();
  });
});
