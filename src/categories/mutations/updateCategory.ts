import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const UpdateCategory = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string()
});

export default resolver.pipe(resolver.zod(UpdateCategory), resolver.authorize(), async ({ id, ...data }) => {
  const category = await db.category.update({ where: { id }, data });
  return category;
});
