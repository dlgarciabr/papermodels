import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const DeleteCategory = z.object({
  id: z.number()
});

export default resolver.pipe(resolver.zod(DeleteCategory), resolver.authorize(), async ({ id }) => {
  const category = await db.category.deleteMany({ where: { id } });
  return category;
});
