import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const DeleteItemIntegration = z.object({
  id: z.number()
});

export default resolver.pipe(resolver.zod(DeleteItemIntegration), resolver.authorize(), async ({ id }) => {
  const itemIntegration = await db.itemIntegration.deleteMany({ where: { id } });
  return itemIntegration;
});
