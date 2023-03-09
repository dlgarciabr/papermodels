import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { CreateSystemParameterValidation } from '../schemas';

export default resolver.pipe(resolver.zod(CreateSystemParameterValidation), resolver.authorize(), async (input) => {
  const systemParameter = await db.systemParameter.create({
    data: {
      ...input
    }
  });

  return systemParameter;
});
