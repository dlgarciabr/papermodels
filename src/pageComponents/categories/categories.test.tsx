import { expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import {
  render,
  screen,
  waitFor,
  cleanup,
  setupUsePaginatedQueryOnce,
  mockRouterOperation,
  setupUseQuery
} from 'test/utils';
import CategoriesPage from '.';
import NewCategoryPage from './new';
import { ISetupUsePaginatedQuery } from 'test/types';
import { ARIA_ROLE } from 'test/ariaRoles';
import EditCategoryPage from './[categoryId]/edit';

// global arrange
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

vi.mock('src/categories/queries/getCategories', () => {
  const resolver = vi.fn() as any;
  resolver._resolverType = 'query';
  resolver._routePath = '/api/rpc/getCategories';
  return { default: resolver };
});

vi.mock('src/categories/mutations/createCategory', () => {
  const resolver = vi.fn() as any;
  resolver._resolverType = 'query';
  resolver._routePath = '/api/rpc/createCategory';
  return { default: resolver };
});

const globalUsePaginatedQueryParams: ISetupUsePaginatedQuery = {
  collectionName: 'categories',
  items: categories.slice(0, 10),
  hasMore: true
};

describe('Category', () => {
  test('Open Category list with items', () => {
    // arrange
    setupUsePaginatedQueryOnce(globalUsePaginatedQueryParams);

    // act
    render(<CategoriesPage />);

    // assert
    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Category' })).toBeInTheDocument();
    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: categories[0]?.name })).toBeInTheDocument();
  });

  test('Open Category list and navigate through pages', async () => {
    // arrange
    setupUsePaginatedQueryOnce(globalUsePaginatedQueryParams);

    const { rerender } = render(<CategoriesPage />, {
      router: {
        push: mockRouterOperation(() => rerender(<CategoriesPage />))
      }
    });

    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: categories[0]?.name })).toBeInTheDocument();

    setupUsePaginatedQueryOnce({
      ...globalUsePaginatedQueryParams,
      items: categories.slice(10),
      hasMore: false
    });

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Next' }));

    // assert
    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: categories[10]?.name })).toBeInTheDocument();
  });
});

describe('Category creating', () => {
  test('User create a new category', async () => {
    // arrange
    const categoryName = 'name test';

    setupUsePaginatedQueryOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: categoryName
        }
      ],
      hasMore: false
    });

    render(<NewCategoryPage />, {
      router: {
        push: mockRouterOperation(() => {
          cleanup();
          render(<CategoriesPage />);
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

    await userEvent.type(nameTexfield, categoryName);
    await userEvent.type(descriptionTexfield, 'description test');

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Create Category' }));

    // assert
    await waitFor(() =>
      expect(screen.queryByRole(ARIA_ROLE.STRUCTURE.HEADING, { name: 'Create New Category' })).not.toBeInTheDocument()
    );

    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Category' })).toBeInTheDocument();

    expect(screen.getByText(categoryName)).toBeInTheDocument();
  });
});

describe('Category changing', () => {
  test('User edit an existing category', async () => {
    // arrange
    const categoryName = 'name test';
    const categoryDescription = 'desc test';

    const categoryNewName = 'new name test';
    const categoryNewDescription = 'new desc test';

    setupUsePaginatedQueryOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: categoryName
        }
      ],
      hasMore: false
    });

    setupUseQuery({ name: categoryName, description: categoryDescription });

    render(<CategoriesPage />, {
      router: {
        push: mockRouterOperation(() => {
          cleanup();
          render(<EditCategoryPage />);
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

    expect((nameTexfield as HTMLInputElement).value).toBe(categoryName);
    expect((descriptionTexfield as HTMLInputElement).value).toBe(categoryDescription);

    await userEvent.type(nameTexfield, categoryNewName);
    await userEvent.type(descriptionTexfield, categoryNewDescription);

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Update Category' }));

    setupUsePaginatedQueryOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: categoryNewName
        }
      ],
      hasMore: false
    });
    cleanup();
    render(<CategoriesPage />);
    // assert

    expect(screen.getByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Category' })).toBeInTheDocument();

    expect(screen.getByText(categoryNewName)).toBeInTheDocument();
  });
});
