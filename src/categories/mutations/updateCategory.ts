import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { UpdateCategoryValidation } from '../schemas';

// const UpdateCategoryValidation = z.object({
//   id: z.number(),
//   ...basicValidation
// });

export default resolver.pipe(resolver.zod(UpdateCategoryValidation), resolver.authorize(), async ({ id, ...data }) => {
  const category = await db.category.update({ where: { id }, data });
  return category;
});

export { UpdateCategoryValidation };
