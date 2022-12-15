// import userEvent from '@testing-library/user-event';
// import { BlitzProvider } from '@blitzjs/next';
// import { render } from "@testing-library/react";
// import { RouterContext, BlitzProvider } from 'blitz';
import { render } from "test/utils";
import { vitest } from "vitest";
import CategoriesPage from ".";
import getCategories from "src/categories/queries/getCategories";

// const router = createRouter('', { user: 'nikita' }, '', {
//   initialProps: {},
//   pageLoader: jest.fn(),
//   App: jest.fn(),
//   Component: jest.fn(),
// });

describe("Category", () => {
  test("Open Category list", () => {
    render(<CategoriesPage />);
    // const { baseElement } = render(<CategoriesPage />, {
    //   router: {
    //     pathname: '/categories',
    //     query: {}
    //   },
    // });
    expect(true).toBeTruthy();
  });
});
