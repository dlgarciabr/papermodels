// TODO remove after total migration to the integration api
/* istanbul ignore file -- @preserve */
import db from 'db';
import { api } from 'src/blitz-server';

export default api(async (_req, res, _ctx) => {
  console.log(`
===================================================================================
|                        Starting Item integration job...                         |
===================================================================================
`);

  await db.$queryRaw`SELECT 1`;
  res.status(200).send({});
});
