// import userEvent from '@testing-library/user-event';
// import { BlitzProvider } from '@blitzjs/next';
import { render } from "@testing-library/react";

import DummysPage from ".";

describe("Dummy", () => {
  test("Open Dummy list", () => {
    render(<DummysPage />);
    expect(true).toBeTruthy();
  });
});
