import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';
import { basicValidation } from './createCategory';

export const UpdateCategoryValidation = z.object({
  id: z.number(),
  ...basicValidation
});

export default resolver.pipe(resolver.zod(UpdateCategoryValidation), resolver.authorize(), async ({ id, ...data }) => {
  const category = await db.category.update({ where: { id }, data });
  return category;
});
