import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const DeleteSystemParameters = z.object({
  ids: z.array(z.number()).nullish(),
  keys: z.array(z.string()).nullish()
});

export default resolver.pipe(resolver.zod(DeleteSystemParameters), resolver.authorize(), async ({ ids, keys }) => {
  if ((!ids || ids.length === 0) && (!keys || keys.length === 0)) {
    throw 'IDs or KEYs not provided to mutation';
  }
  const where = {};
  if (ids && ids.length > 0) {
    where['id'] = {
      in: ids
    };
  }
  if (keys && keys.length > 0) {
    where['key'] = {
      in: keys
    };
  }
  const systemParameter = await db.systemParameter.deleteMany({
    where: {
      ...where
    }
  });
  return systemParameter;
});
