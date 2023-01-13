import { resolver } from '@blitzjs/rpc';
import db, { FileType } from 'db';
import { z } from 'zod';

const CreateItem = z.object({
  name: z.string(),
  description: z.string(),
  categoryId: z.number(),
  files: z.array(
    z.object({
      storagePath: z.string(),
      artifactType: z.enum([FileType.scheme, FileType.instruction, FileType.preview]),
      index: z.number()
    })
  )
});

export default resolver.pipe(resolver.zod(CreateItem), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const item = await db.item.create({
    data: {
      ...input,
      files: {
        create: input.files.map((file) => ({
          storagePath: file.storagePath,
          artifactType: file.artifactType,
          index: file.index
        }))
      }
    }
  });

  return item;
});
