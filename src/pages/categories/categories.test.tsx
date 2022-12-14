// import userEvent from '@testing-library/user-event';
// import { BlitzProvider } from '@blitzjs/next';
import { render } from "@testing-library/react";

import CategoriesPage from ".";

describe("Dummy", () => {
  test("Open Dummy list", () => {
    render(<CategoriesPage />);
    expect(true).toBeTruthy();
  });
});
