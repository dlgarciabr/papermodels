import { expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { render, screen, setupUsePaginatedQueryOnce, mockRouterOperation } from "test/utils";
import CategoriesPage from ".";
import NewCategoryPage from "./new";
import { ISetupUsePaginatedQuery } from "test/types";

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

vi.mock("src/categories/queries/getCategories", () => {
  const resolver = vi.fn() as any;
  resolver._resolverType = "query";
  resolver._routePath = "/api/rpc/getCategories";
  return { default: resolver };
});

vi.mock("src/categories/mutations/createCategory", () => {
  const resolver = vi.fn() as any;
  resolver._resolverType = "query";
  resolver._routePath = "/api/rpc/createCategory";
  return { default: resolver };
});

const globalUsePaginatedQueryParams: ISetupUsePaginatedQuery = {
  collectionName: "categories",
  items: categories.slice(0, 10),
  hasMore: true,
};

describe("Category", () => {
  test("Open Category list with items", () => {
    // arrange
    setupUsePaginatedQueryOnce(globalUsePaginatedQueryParams);

    // act
    render(<CategoriesPage />);

    // assert
    expect(screen.getByRole("link", { name: "Create Category" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: categories[0]?.name })).toBeInTheDocument();
  });

  test("Open Category list and navigate through pages", async () => {
    // arrange
    setupUsePaginatedQueryOnce(globalUsePaginatedQueryParams);

    const { rerender } = render(<CategoriesPage />, {
      router: {
        push: mockRouterOperation(() => rerender(<CategoriesPage />)),
      },
    });

    expect(screen.getByRole("link", { name: categories[0]?.name })).toBeInTheDocument();

    setupUsePaginatedQueryOnce({
      ...globalUsePaginatedQueryParams,
      items: categories.slice(10),
      hasMore: false,
    });

    // act
    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    // assert
    expect(screen.getByRole("link", { name: categories[10]?.name })).toBeInTheDocument();
  });
});

describe("Category creating", () => {
  test("User create a new category", async () => {
    // arrange
    render(<NewCategoryPage />);

    // act
    const nameTexfield = screen.getByRole("textbox", {
      name: "Name",
    });
    const descriptionTexfield = screen.getByRole("textbox", {
      name: "Description",
    });

    await userEvent.type(nameTexfield, "name test");
    await userEvent.type(descriptionTexfield, "description test");

    await userEvent.click(screen.getByRole("button", { name: "Create Category" }));
    // assert
  });
});
