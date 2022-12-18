import { vi } from "vitest";
import { render as defaultRender } from "@testing-library/react";
import { renderHook as defaultRenderHook } from "@testing-library/react-hooks";
import { NextRouter } from "next/router";
import { BlitzProvider, RouterContext } from "@blitzjs/next";
import { usePaginatedQuery } from "@blitzjs/rpc";
import { QueryClient } from "@tanstack/react-query";
import { ISetupUsePaginatedQuery } from "./types";

export * from "@testing-library/react";

export const mockRouter: NextRouter = {
  basePath: "",
  pathname: "/",
  route: "/",
  asPath: "/",
  query: {},
  isReady: true,
  isLocaleDomain: false,
  isPreview: false,
  push: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
};

// --------------------------------------------------------------------------------
// This file customizes the render() and renderHook() test functions provided
// by React testing library. It adds a router context wrapper with a mocked router.
//
// You should always import `render` and `renderHook` from this file
//
// This is the place to add any other context providers you need while testing.
// --------------------------------------------------------------------------------

// --------------------------------------------------
// render()
// --------------------------------------------------
// Override the default test render with our own
//
// You can override the router mock like this:
//
// const { baseElement } = render(<MyComponent />, {
//   router: { pathname: '/my-custom-pathname' },
// });
// --------------------------------------------------

const queryClient = new QueryClient();
export function render(
  ui: RenderUI,
  { wrapper, router, dehydratedState, ...options }: RenderOptions = {}
) {
  if (!wrapper) {
    // console.log('###router1###', router)
    // Add a default context wrapper if one isn't supplied from the test
    wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <BlitzProvider dehydratedState={dehydratedState} client={queryClient}>
          <RouterContext.Provider value={{ ...mockRouter, ...router }}>
            {children}
          </RouterContext.Provider>
        </BlitzProvider>
      );
    };
  }
  return defaultRender(ui, { wrapper, ...options });
}

// --------------------------------------------------
// renderHook()
// --------------------------------------------------
// Override the default test renderHook with our own
//
// You can override the router mock like this:
//
// const result = renderHook(() => myHook(), {
//   router: { pathname: '/my-custom-pathname' },
// });
// --------------------------------------------------
export function renderHook(
  hook: RenderHook,
  { wrapper, router, dehydratedState, ...options }: RenderOptions = {}
) {
  if (!wrapper) {
    // Add a default context wrapper if one isn't supplied from the test
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <BlitzProvider dehydratedState={dehydratedState} client={queryClient}>
        <RouterContext.Provider value={{ ...mockRouter, ...router }}>
          {children}
        </RouterContext.Provider>
      </BlitzProvider>
    );
  }
  return defaultRenderHook(hook, { wrapper, ...options });
}

export const mockNextImage = () => {
  vi.mock("next/image", () => ({
    __esModule: true,
    default: (props: any) => {
      // eslint-disable-next-line @next/next/no-img-element
      return <img {...props} alt={props.alt} />;
    },
  }));
};

const mockUsePaginatedQuery = (
  collectionName: string,
  items: any[],
  hasMore: boolean
): [any, any] => {
  return [
    {
      [collectionName]: items,
      nextPage: {
        take: 10,
        skip: 0,
      },
      hasMore,
      count: 0,
    },
    null as any,
  ];
};

export const setupUsePaginatedQuery = (params: ISetupUsePaginatedQuery) => {
  vi.mocked(usePaginatedQuery).mockReturnValue(
    mockUsePaginatedQuery(params.collectionName, params.items, params.hasMore)
  );
};

export const setupUsePaginatedQueryOnce = (params: ISetupUsePaginatedQuery) => {
  vi.mocked(usePaginatedQuery).mockClear();
  vi.mocked(usePaginatedQuery).mockReturnValueOnce(
    mockUsePaginatedQuery(params.collectionName, params.items, params.hasMore)
  );
};

type DefaultParams = Parameters<typeof defaultRender>;
type RenderUI = DefaultParams[0];
type RenderOptions = DefaultParams[1] & { router?: Partial<NextRouter>; dehydratedState?: unknown };

type DefaultHookParams = Parameters<typeof defaultRenderHook>;
type RenderHook = DefaultHookParams[0];
