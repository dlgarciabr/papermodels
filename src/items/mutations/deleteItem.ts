import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const DeleteItem = z.object({
  id: z.number()
});

export default resolver.pipe(resolver.zod(DeleteItem), resolver.authorize(), async ({ id }) => {
  const item = await db.item.deleteMany({ where: { id } });
  return item;
});
