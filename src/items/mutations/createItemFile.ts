import { resolver } from '@blitzjs/rpc';
import db, { FileType } from 'db';
import { z } from 'zod';

const CreateItemFile = z.object({
  id: z.string(),
  artifactType: z.enum([FileType.scheme, FileType.instruction, FileType.preview]),
  itemId: z.number()
});

export default resolver.pipe(resolver.zod(CreateItemFile), resolver.authorize(), async (input) => {
  console.log('###################');
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const item = await db.itemFile.create({
    data: {
      id: input.id,
      artifactType: input.artifactType,
      itemId: input.itemId
    }
  });

  return item;
});
