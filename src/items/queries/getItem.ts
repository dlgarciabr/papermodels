import { NotFoundError } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const GetItem = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, 'Required')
});

export default resolver.pipe(resolver.zod(GetItem), resolver.authorize(), async ({ id }) => {
  const item = await db.item.findFirst({
    where: { id },
    include: {
      setup: true,
      files: true
    }
  });

  if (!item) throw new NotFoundError();

  return item;
});
