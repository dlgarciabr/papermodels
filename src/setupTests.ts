import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { useMutation } from '@blitzjs/rpc';

const ignoredConsoleErrors = [
  {
    message: 'Warning: Received `%s` for a non-boolean attribute `%s`.',
    params: ['true', 'jsx']
  },
  {
    message: 'Warning: Received `%s` for a non-boolean attribute `%s`.',
    params: ['true', 'global']
  }
  // {
  //   message:
  //     'Warning: A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value'
  // }
];

const originalError = global.console.error;

beforeAll(() => {
  mockDefaultGlobal();
  mockDefaultWindow();
  mockDefaultBlitzRPC();
  mockDefaultFileStorage();
  mockDefaultAllQueries();
  mockDefaultUtilGlobal();
});

beforeEach(() => {
  hideTestErrorsFromConsole();
  initializeDefaultBlitzMock();
});

afterEach(() => {
  vi.resetAllMocks();
});

afterAll(() => {});

/**
 * mock console.error to hide problems that are shown only on test environment
 */
const hideTestErrorsFromConsole = () => {
  vi.spyOn(global.console, 'error').mockImplementation((...args) => {
    const validateArgs = (ignoredParams: string[], args: string[]): boolean => {
      return ignoredParams.every((param) => {
        return args.indexOf(param) !== -1;
      });
    };
    const ignoredError = ignoredConsoleErrors.filter((ignoredError) => {
      return (
        args.includes(ignoredError.message) &&
        (!ignoredError.params || validateArgs(ignoredError.params, args.slice(1)))
      );
    });

    if (ignoredError) {
      return;
    }
    originalError(...args);
  });
};

const mockDefaultBlitzRPC = () => {
  vi.mock('@blitzjs/rpc', () => ({
    useMutation: vi.fn(),
    usePaginatedQuery: vi.fn(),
    useQuery: vi.fn(),
    resolver: {
      pipe: vi.fn(),
      zod: vi.fn(),
      authorize: vi.fn()
    },
    default: { myDefaultKey: vi.fn() },
    namedExport: vi.fn(),
    invoke: vi.fn()
  }));
};

const mockDefaultFileStorage = () => {
  vi.mock('src/utils/fileStorage', () => ({
    deleteFile: vi.fn().mockImplementation(() => Promise.resolve()),
    getFilePath: vi.fn().mockResolvedValue('http://localhost:3000/testUrl'),
    saveFile: vi.fn().mockImplementation(() => Promise.resolve()),
    getFileUrl: vi.fn().mockImplementation(() => ''),
    getThumbnailUrl: vi.fn().mockImplementation(() => '')
  }));
};

const mockDefaultUtilGlobal = () => {
  // vi.mock('src/utils/global', () => ({
  //   downloadFile: vi.fn().mockImplementation(() => { }),
  //   getSimpleRandomKey: vi.fn().mockImplementation(() => ''),
  // }));

  vi.mock('src/utils/global', async () => {
    const actual = (await vi.importActual('src/utils/global')) as {};
    return {
      ...actual,
      downloadFile: vi.fn().mockImplementation(() => {})
    };
  });
};

const initializeDefaultBlitzMock = () => {
  vi.mocked(useMutation).mockReturnValue([async () => {}, {} as any]);
};

const mockDefaultGlobal = () => {
  global.fetch = vi.fn();
};

const mockDefaultWindow = () => {
  window.URL.createObjectURL = vi.fn().mockImplementation(() => '');
};

// TODO implement a code generation for the lines below if MSW will be not used
const mockDefaultAllQueries = () => {
  vi.mock('src/items/queries/getItems', () => {
    const resolver = vi.fn() as any;
    resolver._resolverType = 'query';
    resolver._routePath = '/api/rpc/getItems';
    return { default: resolver };
  });

  vi.mock('src/items/queries/getItem', () => {
    const resolver = vi.fn() as any;
    resolver._resolverType = 'query';
    resolver._routePath = '/api/rpc/getItem';
    return { default: resolver };
  });

  vi.mock('src/items/mutations/createItem', async () => {
    const actual = (await vi.importActual('src/items/mutations/createItem')) as {};
    const resolver = vi.fn() as any;
    resolver._resolverType = 'query';
    resolver._routePath = '/api/rpc/createItem';
    return {
      ...actual,
      default: resolver
    };
  });

  vi.mock('src/categories/mutations/createCategory', async () => {
    const actual = (await vi.importActual('src/categories/mutations/createCategory')) as {};
    const resolver = vi.fn() as any;
    resolver._resolverType = 'query';
    resolver._routePath = '/api/rpc/createCategory';
    return {
      ...actual,
      default: resolver
    };
  });

  vi.mock('src/categories/queries/getCategories', () => {
    const resolver = vi.fn() as any;
    resolver._resolverType = 'query';
    resolver._routePath = '/api/rpc/getCategories';
    return { default: resolver };
  });
};
