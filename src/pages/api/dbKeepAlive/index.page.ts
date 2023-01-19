import { NextApiRequest, NextApiResponse } from 'next';

const pingDB = () => {
  void fetch('https://webhook.site/1167836f-8474-4b11-9604-add5273e67a1');
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
