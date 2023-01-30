import { NotFoundError } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';

const GetItem = z.object({
  id: z.number().optional().refine(Boolean, 'Required')
});

export default resolver.pipe(resolver.zod(GetItem), async ({ id }) => {
  const item = await db.item.findFirst({
    where: { id },
    include: { files: true }
  });

  if (!item) throw new NotFoundError();

  return item;
});
