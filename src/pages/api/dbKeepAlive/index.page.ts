/* istanbul ignore file -- @preserve */
import db from 'db';
import { api } from 'src/blitz-server';

const processIntegration = async () => {
  setTimeout(() => {
    console.log('processIntegration');
  }, 5000);
};

export default api(async (_req, res, _ctx) => {
  await processIntegration();
  await db.$queryRaw`SELECT 1`;
  console.log('db alive!');
  res.status(200).send({});
});
