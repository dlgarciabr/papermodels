import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { CreateSystemParametersValidation } from '../schemas';

export default resolver.pipe(resolver.zod(CreateSystemParametersValidation), resolver.authorize(), async (input) => {
  const systemParameters = await db.systemParameter.createMany({
    data: [...input]
  });

  return systemParameters;
});
