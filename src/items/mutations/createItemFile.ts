import { resolver } from '@blitzjs/rpc';
import db, { FileType } from 'db';
import { z } from 'zod';

const CreateItemFile = z.object({
  storagePath: z.string(),
  artifactType: z.enum([FileType.scheme, FileType.instruction, FileType.preview]),
  itemId: z.number(),
  index: z.number()
});

export default resolver.pipe(resolver.zod(CreateItemFile), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const item = await db.itemFile.create({
    data: {
      storagePath: input.storagePath,
      artifactType: input.artifactType,
      itemId: input.itemId,
      index: input.index
    }
  });

  return item;
});
