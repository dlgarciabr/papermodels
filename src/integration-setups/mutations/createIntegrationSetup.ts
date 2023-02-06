import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const CreateIntegrationSetup = z.object({
  name: z.string(),
  domain: z.string(),
  selector: z.string()
});

export default resolver.pipe(resolver.zod(CreateIntegrationSetup), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const integrationSetup = await db.integrationSetup.create({ data: input });
  return integrationSetup;
});
