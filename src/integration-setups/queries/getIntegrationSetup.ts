import { NotFoundError } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const GetIntegrationSetup = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, 'Required')
});

export default resolver.pipe(resolver.zod(GetIntegrationSetup), resolver.authorize(), async ({ id }) => {
  const integrationSetup = await db.integrationSetup.findFirst({ where: { id } });
  if (!integrationSetup) {
    throw new NotFoundError();
  }
  return integrationSetup;
});
