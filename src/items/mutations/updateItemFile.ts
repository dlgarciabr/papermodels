import { resolver } from '@blitzjs/rpc';
import db, { FileType } from 'db';
import { z } from 'zod';

const UpdateItem = z.object({
  id: z.number(),
  storagePath: z.string(),
  artifactType: z.enum([FileType.scheme, FileType.instruction, FileType.preview]),
  index: z.number()
});

export default resolver.pipe(resolver.zod(UpdateItem), resolver.authorize(), async ({ id, ...data }) => {
  const item = await db.itemFile.update({
    where: { id },
    data: { ...data }
  });

  return item;
});
