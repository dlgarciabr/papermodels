import { expect, vi } from "vitest";

import { render, screen } from "test/utils";
import Home from "./index";

test("renders blitz documentation link", () => {
  // arrange
  const userEmail = "user@email.com";

  vi.mock("src/users/hooks/useCurrentUser", () => ({
    useCurrentUser: () => ({
      id: 1,
      name: "User",
      email: "user@email.com",
      role: "user",
    }),
  }));

  // act
  render(<Home />);

  // assert
  expect(screen.getByText(userEmail)).toBeInTheDocument();

  const linkElement = screen.getByText(/Documentation/i);
  expect(linkElement).toBeInTheDocument();
});

test.todo("User click on logout buton");
