import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { CreateCategoryValidation } from '../schemas';

// export const basicValidation = {
//   name: z.string().min(5).max(30),
//   description: z.string().max(100)
// };

// export const CreateCategoryValidation = z.object({
//   ...basicValidation
// });

export default resolver.pipe(resolver.zod(CreateCategoryValidation), resolver.authorize(), async (input) => {
  const category = await db.category.create({ data: input });
  return category;
});
