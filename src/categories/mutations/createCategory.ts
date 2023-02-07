import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { CreateCategoryValidation } from './validations';

export default resolver.pipe(resolver.zod(CreateCategoryValidation), resolver.authorize(), async (input) => {
  const category = await db.category.create({ data: input });
  return category;
});
