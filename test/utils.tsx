import { vi } from 'vitest';
import { render as defaultRender } from '@testing-library/react';
import { renderHook as defaultRenderHook } from '@testing-library/react-hooks';
import { NextRouter } from 'next/router';
import { BlitzProvider, RouterContext } from '@blitzjs/next';
import { useMutation, usePaginatedQuery, useQuery, invoke } from '@blitzjs/rpc';
import { QueryClient } from '@tanstack/react-query';
import { ISetupUseInvoke, ISetupUsePaginatedQuery } from './types';
import { ToastContainer } from 'react-toastify';

export * from '@testing-library/react';

export const createMockRouter = (router: Partial<NextRouter>): NextRouter => ({
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
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
    emit: vi.fn()
  },
  isFallback: false,
  ...router
});

let mockedRouter: NextRouter;

export const getMockedRouter = (): NextRouter => mockedRouter;

/**
 *
 * @param router
 * @returns
 */
export const modifyMockedRouter = (router: Partial<NextRouter>) => {
  mockedRouter = { ...mockedRouter, ...router };
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
export function render(ui: RenderUI, { wrapper, router, dehydratedState, ...options }: RenderOptions = {}) {
  if (!wrapper) {
    // Add a default context wrapper if one isn't supplied from the test
    mockedRouter = createMockRouter({ ...router });
    const useRouter = vi.spyOn(require('next/router'), 'useRouter');
    useRouter.mockImplementation(() => mockedRouter);
    wrapper = ({ children }: { children: React.ReactNode }) => {
      return (
        <>
          <ToastContainer />
          <BlitzProvider dehydratedState={dehydratedState} client={queryClient}>
            <RouterContext.Provider value={mockedRouter}>{children}</RouterContext.Provider>
          </BlitzProvider>
        </>
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
export function renderHook(hook: RenderHook, { wrapper, router, dehydratedState, ...options }: RenderOptions = {}) {
  if (!wrapper) {
    // Add a default context wrapper if one isn't supplied from the test
    wrapper = ({ children }: { children: React.ReactNode }) => (
      <BlitzProvider dehydratedState={dehydratedState} client={queryClient}>
        <RouterContext.Provider value={createMockRouter({ ...router })}>{children}</RouterContext.Provider>
      </BlitzProvider>
    );
  }
  return defaultRenderHook(hook, { wrapper, ...options });
}

export const mockNextImage = () => {
  vi.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
      // eslint-disable-next-line @next/next/no-img-element
      return <img {...props} alt={props.alt} />;
    }
  }));
};

const mockUsePaginatedQuery = (collectionName: string, items: any[], hasMore: boolean): [any, any] => {
  return [
    {
      [collectionName]: items,
      nextPage: {
        take: 10,
        skip: 0
      },
      hasMore,
      count: 0
    },
    null as any
  ];
};

export const setupUseQueryReturn = <T,>(returnValue: T, options?: { refetchResolved?: T | null }) => {
  const refetch = vi.fn().mockImplementation(() => console.log('REFETCH NOT IMPLEMENTED'));
  if (options?.refetchResolved) {
    refetch.mockImplementation(() => {
      vi.mocked(useQuery).mockReturnValue([
        options?.refetchResolved,
        {
          setQueryData: vi.fn(),
          refetch
        } as any
      ]);
    });
  }
  vi.mocked(useQuery).mockReturnValue([
    returnValue,
    {
      setQueryData: vi.fn(),
      refetch
    } as any
  ]);
};

export const setupUseQueryReturnOnce = <T,>(returnValue: T) => {
  vi.mocked(useQuery).mockReset();
  vi.mocked(useQuery).mockReturnValueOnce([returnValue, {} as any]);
};

export const setupUseQueryImplementation = <T,>(implementation: (queryFn: T) => any[]) => {
  vi.mocked(useQuery).mockImplementation(implementation as any);
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

export const setupUseInvokeOnce = (params: ISetupUseInvoke) => {
  vi.mocked(invoke).mockClear();
  vi.mocked(invoke).mockReturnValueOnce(
    Promise.resolve({
      [params.collectionName]: params.items,
      hasMore: params.hasMore
    })
  );
};

// export const setupUseInvokeStack = (params: ISetupUseInvoke[]) => {
//   let paramsStack = [...params];
//   const mockInvokeOnce = (returnInvoke) => {
//     vi.mocked(invoke).mockImplementationOnce(() => {
//       paramsStack.pop();
//       if (paramsStack) {
//         mockInvokeOnce(paramsStack[0]);
//       }
//       return {
//         [paramsStack[0].collectionName]: paramsStack[0].items,
//         hasMore: paramsStack[0].hasMore
//       };
//     });
//   }
//   mockInvokeOnce(paramsStack[0]);
// };

export const setupUseInvokeImplementation = <T,>(implementation: (queryFn: T) => any[]) => {
  vi.mocked(invoke).mockImplementation(implementation as any);
};

export const setupUseInvoke = (callback: (queryFn: (...args: any) => any, params: unknown) => Promise<any>) => {
  vi.mocked(invoke).mockClear();
  vi.mocked(invoke).mockImplementation(callback);
};

export const setupUseMutation = <T,>(mutation: Promise<T>) => {
  vi.mocked(useMutation).mockReturnValue([mutation as any, {} as any]);
};

export const setupUseMutationImplementation = (implementation: any) => {
  vi.mocked(useMutation).mockImplementation(implementation);
};

export const setupUseMutationOnce = <T,>(mutation: Promise<T>) => {
  vi.mocked(useMutation).mockReturnValueOnce([mutation as any, {} as any]);
};

export const setupUseMutationStack = (mutations: Promise<any>[]) => {
  let mutationsStack = [...mutations];
  const mockMutationOnce = (returnMutation) => {
    vi.mocked(useMutation).mockImplementationOnce(async () => {
      await mutationsStack.pop();
      if (mutationsStack) {
        mockMutationOnce(mutationsStack[0]);
      }
      return [returnMutation as any, {} as any] as any;
    });
  };
  mockMutationOnce(mutationsStack[0]);
};

export const mockRouterOperation = (callback: Function) =>
  vi.fn(async (url: any, as?: any, options?: any) => {
    callback(url, as, options);
    return true;
  });

export const mockFilesToDrop = (fileData: { name: string; mimeType: string; blob: any[] }[]) => {
  const files = fileData.map((data) => {
    const file = new File(data.blob, data.name, { type: data.mimeType });
    Object.assign(file, {
      arrayBuffer: vi.fn().mockResolvedValue(data.blob)
    });
    return file;
  });
  return {
    dataTransfer: {
      files,
      items: files.map((file) => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file
      })),
      types: ['Files']
    }
  };
};

type DefaultParams = Parameters<typeof defaultRender>;
type RenderUI = DefaultParams[0];
type RenderOptions = DefaultParams[1] & { router?: Partial<NextRouter>; dehydratedState?: unknown };

type DefaultHookParams = Parameters<typeof defaultRenderHook>;
type RenderHook = DefaultHookParams[0];
