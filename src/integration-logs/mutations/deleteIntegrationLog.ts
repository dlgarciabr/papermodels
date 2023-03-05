import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const DeleteIntegrationLog = z.object({
  id: z.number()
});

export default resolver.pipe(resolver.zod(DeleteIntegrationLog), resolver.authorize(), async ({ id }) => {
  const integrationLog = await db.integrationLog.deleteMany({ where: { id } });
  return integrationLog;
});
