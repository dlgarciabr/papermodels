import { expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { usePaginatedQuery } from "@blitzjs/rpc";

import { render, screen, mockUsePaginatedQuery } from "test/utils";
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

// vi.mock("@blitzjs/rpc", () => ({
//   useMutation: () => [],
//   usePaginatedQuery: vi.fn()
// }));

vi.mock("src/categories/queries/getCategories", () => {
  const resolver = vi.fn() as any;
  resolver._resolverType = "query";
  resolver._routePath = "/api/rpc/getCategories";
  return { default: resolver };
});

describe("Category", () => {
  test("Open Category list with items", () => {
    // arrange
    vi.mocked(usePaginatedQuery).mockReturnValueOnce(
      mockUsePaginatedQuery("categories", categories.slice(0, 10), true)
    );

    // act
    render(<CategoriesPage />);

    // assert
    expect(screen.getByRole("link", { name: "Create Category" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: categories[0]?.name })).toBeInTheDocument();
  });

  test("Open Category list and navigate through pages", async () => {
    // arrange
    vi.mocked(usePaginatedQuery).mockReturnValueOnce(
      mockUsePaginatedQuery("categories", categories.slice(10), false)
    );
    render(<CategoriesPage />);

    // screen.debug();
    // act
    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    // assert
    expect(screen.getByRole("link", { name: categories[10]?.name })).toBeInTheDocument();
  });
});
