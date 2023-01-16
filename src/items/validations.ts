import { z } from 'zod';
import { FileType } from 'db';

const basicValidation = {
  name: z.string().min(5, 'Field required and must contain at least 5 characters').max(30),
  description: z.string().max(100),
  dificulty: z.number().min(1).max(5),
  assemblyTime: z.number().min(0.5).max(100),
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
      artifactType: z.enum([FileType.scheme, FileType.instruction, FileType.preview]),
      index: z.number()
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
      artifactType: z.enum([FileType.scheme, FileType.instruction, FileType.preview]),
      index: z.number()
    })
  )
});
