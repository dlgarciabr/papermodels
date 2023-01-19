import { api } from 'src/blitz-server';
import db from 'db';

export default api(async (_req, res, _ctx) => {
  await db.$connect();
  res.status(200);
});
