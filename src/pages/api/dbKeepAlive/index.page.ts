import { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

const pingDB = async () =>
  new Promise<void>((resolve) => {
    try {
      https.get('https://webhook.site/1167836f-8474-4b11-9604-add5273e67a1', (_res) => {
        setTimeout(() => pingDB(), 60000);
        resolve();
      });
    } catch (error) {
      setTimeout(() => pingDB(), 60000);
      resolve();
    }
  });

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  await pingDB();
  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies
  });
}
