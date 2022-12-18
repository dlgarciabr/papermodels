import "@testing-library/jest-dom";
import { vi } from "vitest";

beforeEach(() => {});

beforeAll(() => {
  vi.mock("@blitzjs/rpc", () => ({
    useMutation: () => [() => {}],
    usePaginatedQuery: vi.fn(),
    resolver: {
      pipe: vi.fn(),
      zod: vi.fn(),
      //   authorize: vi.fn()
    },
  }));
});

afterEach(() => {
  vi.resetAllMocks();
});

afterAll(() => {});
