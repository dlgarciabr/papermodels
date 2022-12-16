import { expect, vi } from "vitest";

import { render } from "test/utils";
import CategoriesPage from ".";

// global arrange
vi.mock("@blitzjs/rpc", () => ({
  useMutation: () => [],
  usePaginatedQuery: (queryFn: any, params: any, options: any) => [
    {
      categories: [],
      nextPage: {
        take: 0,
        skip: 0,
      },
      hasMore: false,
      count: 0,
    },
    {},
  ],
}));

vi.mock("src/categories/queries/getCategories", () => {
  const resolver = vi.fn() as any;
  resolver._resolverType = "query";
  resolver._routePath = "/api/rpc/getCategories";
  return { default: resolver };
});

describe("Category", () => {
  test("Open Category list", () => {
    // arrange
    render(<CategoriesPage />);

    expect(true).toBeTruthy();
  });
});
