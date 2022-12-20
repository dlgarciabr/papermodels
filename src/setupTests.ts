import '@testing-library/jest-dom';
import { vi } from 'vitest';

const ignoredErrors = [
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

beforeEach(() => {
  /**
   * mock on console.error to hide problems that are shown only on test environment
   */
  vi.spyOn(global.console, 'error').mockImplementation((...args) => {
    const validateArgs = (ignoredParams: string[], args: string[]): boolean => {
      return ignoredParams.every((param) => {
        return args.indexOf(param) !== -1;
      });
    };
    const ignoredError = ignoredErrors.filter((ignoredError) => {
      return (
        args[0].includes(ignoredError.message) &&
        (!ignoredError.params || validateArgs(ignoredError.params, args.slice(1)))
      );
    });

    if (ignoredError) {
      return;
    }
    originalError(...args);
  });
});

beforeAll(() => {
  vi.mock('@blitzjs/rpc', () => ({
    useMutation: () => [() => {}],
    usePaginatedQuery: vi.fn(),
    useQuery: vi.fn(),
    resolver: {
      pipe: vi.fn(),
      zod: vi.fn(),
      authorize: vi.fn()
    }
  }));
});

afterEach(() => {
  vi.resetAllMocks();
});

afterAll(() => {});
