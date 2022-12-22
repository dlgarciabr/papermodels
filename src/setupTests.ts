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
  },
  {
    message:
      'Warning: A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value'
  }
];

const originalError = global.console.error;

beforeAll(() => {
  mockDefaultBlitzRPC();
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
    namedExport: vi.fn()
  }));
};

const initializeDefaultBlitzMock = () => {
  vi.mocked(useMutation).mockReturnValue([async () => {}, {} as any]);
};
