import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { CreateIntegrationSetupValidation } from '../schema';

export default resolver.pipe(resolver.zod(CreateIntegrationSetupValidation), resolver.authorize(), async (input) => {
  const integrationSetup = await db.integrationSetup.create({ data: input });
  return integrationSetup;
});
