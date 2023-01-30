import { FileType } from 'db';
import { z } from 'zod';

const basicItemValidation = {
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

const zFileTypeEnum = z.enum([FileType.instruction, FileType.preview, FileType.scheme, FileType.thumbnail]);

export const CreateItemValidation = z.object({
  ...basicItemValidation,
  files: z.array(
    z.object({
      storagePath: z.string(),
      artifactType: zFileTypeEnum,
      index: z.number()
    })
  )
});

export const UpdateItemValidation = z.object({
  ...basicItemValidation,
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

const basicItemFileValidation = {
  storagePath: z.string(),
  artifactType: zFileTypeEnum,
  itemId: z.number(),
  index: z.number()
};

export const CreateItemFileValidation = z.object({
  ...basicItemFileValidation
});

export const UpdateItemFileValidation = z.object({
  id: z.number(),
  ...basicItemFileValidation
});
