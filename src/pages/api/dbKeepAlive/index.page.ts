/* istanbul ignore file -- @preserve */
import db from 'db';
import { api } from 'src/blitz-server';

const processIntegration = async () => {
  console.log(`Integration process started at ${new Date().toLocaleDateString()}`);
  setTimeout(() => {
    console.log(`Integration process ended at ${new Date().toLocaleDateString()}`);
  }, 5000);
};

export default api(async (_req, res, _ctx) => {
  void processIntegration();
  await db.$queryRaw`SELECT 1`;
  console.log('db alive!');
  res.status(200).send({});
});
