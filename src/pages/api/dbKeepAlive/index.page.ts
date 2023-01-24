/* istanbul ignore file -- @preserve */
import db from 'db';
import { api } from 'src/blitz-server';

export default api(async (_req, res, _ctx) => {
  await db.$queryRaw`SELECT 1`;
  console.log('db alive!');
  res.status(200).send({});
});
