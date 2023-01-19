import { setupServer } from 'msw/node';
import { matchRequestUrl, MockedRequest } from 'msw';
import { handlers as customHandlers } from './msw-handlers';

const mswServer = setupServer(...customHandlers);

const waitForRequest = (method: string, url: string): Promise<MockedRequest> => {
  let requestId = '';
  return new Promise((resolve, reject) => {
    mswServer.events.on('request:start', (req: MockedRequest) => {
      const matchesMethod = req.method.toLowerCase() === method.toLowerCase();
      const matchesUrl = matchRequestUrl(req.url, url);
      if (matchesMethod && matchesUrl) {
        requestId = req.id;
      }
    });
    mswServer.events.on('request:match', (req: MockedRequest) => {
      if (req.id === requestId) {
        resolve(req);
      }
    });
    mswServer.events.on('request:unhandled', (req: MockedRequest) => {
      if (req.id === requestId) {
        reject(new Error(`The ${req.method} ${req.url.href} request was unhandled.`));
      }
    });
  });
};

// const addOrReplaceHandlers = (...newHandlers: any) => {
//   const handlers: RestHandler[] = newHandlers;
//   mswServer.use(
//     ...customHandlers.filter(h1 => !handlers.some(h2 => h2.info.path === h1.info.path)),
//     ...handlers
//   );
// }

export {
  mswServer,
  waitForRequest
  // addOrReplaceHandlers
};
