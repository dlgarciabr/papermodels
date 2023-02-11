import { resolver } from '@blitzjs/rpc';
import db, { ItemStatus } from 'db';
import { z } from 'zod';
import { zFileTypeEnum } from './createItemFile';

const zItemStatusEnum = z.enum([ItemStatus.disable, ItemStatus.enable, ItemStatus.integrating]);

export const basicValidation = {
  name: z.string().min(5, 'Field required and must contain at least 5 characters').max(30),
  description: z.string().max(100),
  status: zItemStatusEnum,
  dificulty: z.number().min(1).max(5).optional(),
  assemblyTime: z.number().min(0.5).max(100).optional(),
  categoryId: z.string().regex(/^((?!-1).)*$/, 'Field required'),
  author: z.string().max(50).nullable(),
  authorLink: z.union([z.string().max(100).url().nullish(), z.literal('')]),
  licenseType: z.string().max(50).nullable(),
  licenseTypeLink: z.union([z.string().max(200).url().nullish(), z.literal('')])
};

export const CreateItemValidation = z.object({
  ...basicValidation,
  files: z.array(
    z.object({
      storagePath: z.string(),
      artifactType: zFileTypeEnum
    })
  )
});

export default resolver.pipe(resolver.zod(CreateItemValidation), resolver.authorize(), async (input) => {
  const item = await db.item.create({
    data: {
      ...input,
      categoryId: parseInt(input.categoryId),
      files: {
        create: input.files.map((file) => ({
          storagePath: file.storagePath,
          artifactType: file.artifactType
        }))
      }
    }
  });

  return item;
});
