import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { UpdateItemValidation } from '../schemas';

export default resolver.pipe(resolver.zod(UpdateItemValidation), resolver.authorize(), async ({ id, ...data }) => {
  const item = await db.item.update({
    where: { id },
    data: {
      ...data,
      categoryId: parseInt(data.categoryId),
      files: {
        upsert: data.files.map((file) => ({
          // Appears to be a prisma bug,
          // because `|| 0` shouldn't be needed
          where: { id: file.id },
          create: { storagePath: file.storagePath, artifactType: file.artifactType },
          update: { storagePath: file.storagePath, artifactType: file.artifactType }
        }))
      }
    },
    include: {
      files: true
    }
  });

  return item;
});
