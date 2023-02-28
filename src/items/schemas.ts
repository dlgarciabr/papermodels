import { FileType, ItemStatus } from 'db';
import { z } from 'zod';

const zItemStatusEnum = z.enum([ItemStatus.disable, ItemStatus.enable, ItemStatus.integrating, ItemStatus.validate]);
const zFileTypeEnum = z.enum([FileType.instruction, FileType.preview, FileType.scheme]);

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

export const UpdateItemValidation = z.object({
  ...basicValidation,
  id: z.number(),
  files: z.array(
    z.object({
      id: z.number(),
      storagePath: z.string(),
      artifactType: zFileTypeEnum
    })
  )
});

export const basicItemFileValidation = {
  storagePath: z.string(),
  artifactType: zFileTypeEnum,
  itemId: z.number()
};

export const CreateItemFileValidation = z.object({
  ...basicItemFileValidation
});

export const UpdateItemFileValidation = z.object({
  id: z.number(),
  ...basicItemFileValidation
});
