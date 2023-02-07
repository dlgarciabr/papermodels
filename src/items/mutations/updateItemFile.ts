import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { UpdateItemFileValidation } from './validations';

export default resolver.pipe(resolver.zod(UpdateItemFileValidation), resolver.authorize(), async ({ id, ...data }) => {
  const item = await db.itemFile.update({
    where: { id },
    data: { ...data }
  });

  return item;
});
