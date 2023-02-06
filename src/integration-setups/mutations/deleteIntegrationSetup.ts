import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const DeleteIntegrationSetup = z.object({
  id: z.number()
});

export default resolver.pipe(resolver.zod(DeleteIntegrationSetup), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const integrationSetup = await db.integrationSetup.deleteMany({ where: { id } });
  return integrationSetup;
});
