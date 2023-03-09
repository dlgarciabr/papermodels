import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { CreateIntegrationLogValidation } from '../schema';

export default resolver.pipe(resolver.zod(CreateIntegrationLogValidation), resolver.authorize(), async (input) => {
  const integrationLog = await db.integrationLog.create({ data: input });
  return integrationLog;
});
