import db from 'db';
import { api } from 'src/blitz-server';

const dbKeepAlive = async () => {
  try {
    await db.$connect();
    console.log('db.$connect();');
  } finally {
    setTimeout(() => dbKeepAlive(), 30000);
  }
};

export default api(async (_req, res, _ctx) => {
  await dbKeepAlive();
  res.status(200).send({});
});
