import { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

const pingDB = () => {
  try {
    https.get('https://webhook.site/1167836f-8474-4b11-9604-add5273e67a1');
  } catch (error) {
    console.error(error);
  }
  setTimeout(() => pingDB(), 60000);
};

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  pingDB();
  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies
  });
}
