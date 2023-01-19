import db from 'db';
import { api } from 'src/blitz-server';

export default api(async (_req, res, _ctx) => {
  await db.$connect();
  console.log('db alive!');
  res.status(200).send({});
});
