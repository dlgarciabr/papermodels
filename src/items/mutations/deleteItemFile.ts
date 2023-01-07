import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const DeleteItem = z.object({
  id: z.number()
});

export default resolver.pipe(resolver.zod(DeleteItem), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const itemFile = await db.itemFile.deleteMany({ where: { id } });
  return itemFile;
});
