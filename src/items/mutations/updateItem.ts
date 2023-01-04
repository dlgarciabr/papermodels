import { resolver } from '@blitzjs/rpc';
import db, { FileType } from 'db';
import { z } from 'zod';

const UpdateItem = z.object({
  id: z.number(),
  name: z.string(),
  files: z.array(
    z.object({ id: z.string(), artifactType: z.enum([FileType.scheme, FileType.instruction, FileType.preview]) })
  )
});

export default resolver.pipe(resolver.zod(UpdateItem), resolver.authorize(), async ({ id, ...data }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const item = await db.item.update({
    where: { id },
    data: {
      ...data,
      files: {
        upsert: data.files.map((file) => ({
          // Appears to be a prisma bug,
          // because `|| 0` shouldn't be needed
          where: { id: file.id },
          create: { id: file.id, artifactType: file.artifactType },
          update: { id: file.id, artifactType: file.artifactType }
        }))
      }
    },
    include: {
      files: true
    }
  });

  return item;
});
