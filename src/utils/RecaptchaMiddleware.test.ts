import { vi } from 'vitest';
import RecaptchaMiddleware from './RecaptchaMiddleware';

// global arrange
const globalRequest = {
  url: '/api/rpc/getItemAnonymous',
  body: {
    params: {
      gRecaptchaToken: 'token123'
    }
  }
};

describe('RecaptchaMidleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('should call `next` if the URL is not protected', async () => {
    const req = {
      ...globalRequest,
      url: '/api/rpc/getData'
    };
    const next = vi.fn().mockImplementationOnce(() => {});
    const json = vi.fn();
    const status = () => ({ json });
    const res = { status };
    await RecaptchaMiddleware(req as any, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });

  test('should return a 500 status code and error message if the `gRecaptchaToken` or `gRecaptchaSecret` are missing', async () => {
    process = {
      ...process,
      env: {
        ...process.env,
        NEXT_RECAPTCHA_SECRET: undefined
      }
    };
    const next = vi.fn().mockImplementationOnce(() => {});
    const json = vi.fn();
    const status = () => ({ json });
    const res = { status };
    await RecaptchaMiddleware(globalRequest as any, res as any, next);
    expect(next).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith({
      status: 'failure',
      message: 'Error validating captcha'
    });
  });

  test('should return a 200 status code and error message if the recaptcha validation fails', async () => {
    process = {
      ...process,
      env: {
        ...process.env,
        NEXT_RECAPTCHA_SECRET: 'secret123'
      }
    };
    const fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ score: 0.4 })
    });
    global.fetch = fetch;
    const next = vi.fn().mockImplementationOnce(() => {
      console.log('##############200');
    });
    const json = vi.fn();
    const status = () => ({ json });
    const res = { status };

    await RecaptchaMiddleware(globalRequest as any, res as any, next);
    expect(next).not.toHaveBeenCalled();
    expect(json).toHaveBeenCalledWith({
      status: 'failure',
      message: 'Google ReCaptcha Failure'
    });
  });

  test('should call `next` if the recaptcha validation passes', async () => {
    process = {
      ...process,
      env: {
        ...process.env,
        NEXT_RECAPTCHA_SECRET: 'secret123'
      }
    };
    const fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({ score: 0.6 })
    });
    global.fetch = fetch;
    const next = vi.fn().mockImplementationOnce(() => {});
    const json = vi.fn();
    const status = () => ({ json });
    const res = { status };

    await RecaptchaMiddleware(globalRequest as any, res as any, next);
    expect(next).toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
  });
});
