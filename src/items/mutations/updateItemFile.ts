import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';
import { basicItemFileValidation } from './createItemFile';

export const UpdateItemFileValidation = z.object({
  id: z.number(),
  ...basicItemFileValidation
});

export default resolver.pipe(resolver.zod(UpdateItemFileValidation), resolver.authorize(), async ({ id, ...data }) => {
  const item = await db.itemFile.update({
    where: { id },
    data: { ...data }
  });

  return item;
});
