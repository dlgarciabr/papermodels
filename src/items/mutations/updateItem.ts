import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';
import { basicValidation } from './createItem';
import { zFileTypeEnum } from './createItemFile';

export const UpdateItemValidation = z.object({
  ...basicValidation,
  id: z.number(),
  files: z.array(
    z.object({
      id: z.number(),
      storagePath: z.string(),
      artifactType: zFileTypeEnum,
      index: z.number()
    })
  )
});

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
          create: { storagePath: file.storagePath, artifactType: file.artifactType, index: file.index },
          update: { storagePath: file.storagePath, artifactType: file.artifactType, index: file.index }
        }))
      }
    },
    include: {
      files: true
    }
  });

  return item;
});
