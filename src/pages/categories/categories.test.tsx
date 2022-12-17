import { expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen } from "test/utils";
import CategoriesPage from ".";

// global arrange
const categories = [
  {
    id: 1,
    name: "Airplanes",
  },
  {
    id: 2,
    name: "Cars",
  },
  {
    id: 3,
    name: "Houses",
  },
  {
    id: 4,
    name: "Animals",
  },
  {
    id: 5,
    name: "Trains",
  },
  {
    id: 6,
    name: "Emergency places",
  },
  {
    id: 7,
    name: "Boats&Ships",
  },
  {
    id: 8,
    name: "Stores",
  },
  {
    id: 9,
    name: "Service building",
  },
  {
    id: 10,
    name: "Plants",
  },
  {
    id: 11,
    name: "Miscelaneus",
  },
];

// const testMock = () => {
vi.mock("@blitzjs/rpc", () => ({
  useMutation: () => [],
  usePaginatedQuery: (queryFn: any, params: any, options: any) => [
    {
      categories: categories.slice(0, 10),
      // categories,
      nextPage: {
        take: 10,
        skip: 0,
      },
      hasMore: true,
      count: 11,
    },
    {},
  ],
}));
// }

vi.mock("src/categories/queries/getCategories", () => {
  const resolver = vi.fn() as any;
  resolver._resolverType = "query";
  resolver._routePath = "/api/rpc/getCategories";
  return { default: resolver };
});

describe("Category", () => {
  test("Open Category list with items", () => {
    // arrange

    // act
    render(<CategoriesPage />);

    // assert

    expect(screen.getByRole("link", { name: "Create Category" })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: categories[0]?.name })).toBeInTheDocument();
  });

  test("Open Category list and navigate through pages", async () => {
    // arrange
    render(<CategoriesPage />);

    vi.mock("@blitzjs/rpc", () => ({
      useMutation: () => [],
      usePaginatedQuery: (queryFn: any, params: any, options: any) => [
        {
          categories: categories.slice(11),
          nextPage: {
            take: 1,
            skip: 0,
          },
          hasMore: true,
          count: 11,
        },
        {},
      ],
    }));
    // act
    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    // assert
    expect(screen.getByRole("link", { name: categories[11]?.name })).toBeInTheDocument();
  });
});
