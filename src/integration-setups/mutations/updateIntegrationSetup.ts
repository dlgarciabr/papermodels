import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { UpdateIntegrationSetupValidation } from './validations';

export default resolver.pipe(
  resolver.zod(UpdateIntegrationSetupValidation),
  resolver.authorize(),
  async ({ id, ...data }) => {
    const integrationSetup = await db.integrationSetup.update({ where: { id }, data });
    return integrationSetup;
  }
);
