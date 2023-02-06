import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const UpdateIntegrationSetup = z.object({
  id: z.number(),
  name: z.string(),
  domain: z.string(),
  selector: z.string()
});

export default resolver.pipe(resolver.zod(UpdateIntegrationSetup), resolver.authorize(), async ({ id, ...data }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const integrationSetup = await db.integrationSetup.update({ where: { id }, data });
  return integrationSetup;
});
