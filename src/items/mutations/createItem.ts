import { resolver } from '@blitzjs/rpc';
import db, { FileType } from 'db';
import { z } from 'zod';

const CreateItem = z.object({
  name: z.string(),
  description: z.string(),
  categoryId: z.number(),
  files: z.array(
    z.object({ id: z.string(), artifactType: z.enum([FileType.scheme, FileType.instruction, FileType.preview]) })
  )
});

export default resolver.pipe(resolver.zod(CreateItem), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const item = await db.item.create({
    data: {
      ...input,
      files: {
        create: input.files.map((file) => ({
          id: file.id,
          artifactType: file.artifactType
        }))
      }
    }
  });

  return item;
});
