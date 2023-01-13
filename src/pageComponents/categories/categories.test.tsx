import { expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import {
  render,
  screen,
  waitFor,
  cleanup,
  setupUseInvokeOnce,
  mockRouterOperation,
  setupUseQueryReturn,
  setupUseMutationOnce,
  modifyMockedRouter,
  setupUseInvoke
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

describe('Listing Category', () => {
  test('Open Category list with items', async () => {
    // arrange
    setupUseInvokeOnce({
      collectionName: 'categories',
      items: categories.slice(0, 10),
      hasMore: true
    });

    // act
    render(<CategoriesPage />);

    // assert
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: 'Create Category' })).toBeInTheDocument();
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: categories[0]?.name })).toBeInTheDocument();
  });

  test('Open Category list and navigate through pages', async () => {
    // arrange
    const useInvokeCallback = async (_queryFn, params) => {
      switch (params.skip) {
        case 0:
          return {
            categories: categories.slice(0, 10),
            hasMore: true
          };
        case 10:
          return {
            categories: categories.slice(10),
            hasMore: false
          };
        default:
          return {
            categories: [],
            hasMore: false
          };
      }
    };

    setupUseInvoke(useInvokeCallback);

    let { rerender } = render(<CategoriesPage />, {
      router: {
        push: mockRouterOperation((url) => {
          modifyMockedRouter(url);
          rerender(<CategoriesPage />);
        }),
        query: { page: '0' }
      }
    });

    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: categories[0]?.name })).toBeInTheDocument();

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Next' }));

    // assert
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: categories[10]?.name })).toBeInTheDocument();

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Previous' }));

    // assert
    expect(await screen.findByRole(ARIA_ROLE.WIDGET.LINK, { name: categories[0]?.name })).toBeInTheDocument();
  });
});

describe('Category creating', () => {
  test('User create a new category', async () => {
    // arrange
    const categoryName = 'name test';

    setupUseInvokeOnce({
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

  test('User receives an error trying to create an incomplete new category', async () => {
    // arrange
    const categoryName = 'name test';

    const error = {
      code: 'invalid_type',
      expected: 'string',
      received: 'undefined',
      path: ['name'],
      message: 'Required'
    };

    const createCategoryMutation = vi.fn().mockRejectedValueOnce(error) as any;
    setupUseMutationOnce(createCategoryMutation);

    setupUseInvokeOnce({
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
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Create Category' }));

    // assert
    expect(screen.getByRole(ARIA_ROLE.STRUCTURE.HEADING, { name: 'Create New Category' })).toBeInTheDocument();
  });
});

describe('Category changing', () => {
  test('User edit an existing category', async () => {
    // arrange
    const categoryName = 'name test';
    const categoryDescription = 'desc test';

    const categoryNewName = 'new name test';
    const categoryNewDescription = 'new desc test';

    setupUseInvokeOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: categoryName
        }
      ],
      hasMore: false
    });

    setupUseQueryReturn({ name: categoryName, description: categoryDescription });

    render(<CategoriesPage />, {
      router: {
        push: mockRouterOperation(() => {
          cleanup();
          render(<EditCategoryPage />);
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

    expect((nameTexfield as HTMLInputElement).value).toBe(categoryName);
    expect((descriptionTexfield as HTMLInputElement).value).toBe(categoryDescription);

    await userEvent.type(nameTexfield, categoryNewName);
    await userEvent.type(descriptionTexfield, categoryNewDescription);

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Update Category' }));

    setupUseInvokeOnce({
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

    expect(await screen.findByText(categoryNewName)).toBeInTheDocument();
  });

  // TODO review the test below to work properly
  test.skip('User receives an error trying to edit an incomplete category', async () => {
    // arrange
    const categoryName = 'name test';
    const categoryDescription = 'desc test';

    const categoryNewName = ' ';
    const categoryNewDescription = ' ';

    setupUseInvokeOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: categoryName
        }
      ],
      hasMore: false
    });

    // const error = {
    //   code: 'invalid_type',
    //   expected: 'string',
    //   received: 'undefined',
    //   path: ['name'],
    //   message: 'Required'
    // };

    // const updateCategoryMutation = vi.fn().mockRejectedValueOnce({});
    // setupUseMutationOnce(updateCategoryMutation as any);

    setupUseQueryReturn({ name: categoryName, description: categoryDescription });

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

    // await userEvent.type(nameTexfield, categoryNewName);
    // await userEvent.type(descriptionTexfield, categoryNewDescription);
    // await userEvent.clear(nameTexfield);
    // await userEvent.clear(descriptionTexfield);

    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Update Category' }));

    // assert
    // expect(screen.getByRole(ARIA_ROLE.STRUCTURE.HEADING, { name: 'Edit Category' })).toBeInTheDocument();

    setupUseInvokeOnce({
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
  });
});

describe('Category removing', () => {
  test('User delete a category', async () => {
    // arrange
    const categoryName = 'name test category';

    setupUseInvokeOnce({
      collectionName: 'categories',
      items: [
        {
          id: 1,
          name: categoryName
        }
      ],
      hasMore: false
    });

    window.confirm = vi.fn(() => true);

    render(<CategoriesPage />);

    expect(await screen.findByText(categoryName)).toBeInTheDocument();

    setupUseInvokeOnce({
      collectionName: 'categories',
      items: [],
      hasMore: false
    });

    // act
    await userEvent.click(screen.getByRole(ARIA_ROLE.WIDGET.BUTTON, { name: 'Delete' }));

    // assert
    expect(screen.queryByText(categoryName)).not.toBeInTheDocument();
  });
});
