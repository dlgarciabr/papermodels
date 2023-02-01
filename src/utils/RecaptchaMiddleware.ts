import { MiddlewareNext, MiddlewareResponse, RequestMiddleware } from 'blitz';
import { IncomingMessage } from 'http';

interface IRequestMiddlewareRequest extends IncomingMessage {
  body: any;
  cookies: any;
  query: any;
}

interface IRequestMiddlewareResponse extends MiddlewareResponse {
  status: Function;
}

const protectedUrls = ['/api/rpc/getItemAnonymous', '/api/rpc/getItemsAnonymous'];

const validateCaptcha = async (gRecaptchaToken: string, res: IRequestMiddlewareResponse, next: MiddlewareNext) => {
  const gRecaptchaSecret = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET;
  if (!gRecaptchaToken || !gRecaptchaSecret) {
    res.status(500).json({
      status: 'failure',
      message: 'Error validating captcha'
    });
  }

  const reCaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `secret=${gRecaptchaSecret}&response=${gRecaptchaToken}`
  });

  const captchaResultJson = await reCaptchaResponse.json();
  if (captchaResultJson?.score <= 0.5) {
    res.status(200).json({
      status: 'failure',
      message: 'Google ReCaptcha Failure'
    });
  } else {
    await next();
  }
};

const RecaptchaMidleware: RequestMiddleware = async (
  request: IRequestMiddlewareRequest,
  response: IRequestMiddlewareResponse,
  next: MiddlewareNext
) => {
  if (protectedUrls.some((url) => url === request.url)) {
    await validateCaptcha(request.body.params.gRecaptchaToken, response, next);
  } else {
    await next();
  }
};

export default RecaptchaMidleware;
