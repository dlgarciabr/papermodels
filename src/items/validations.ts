import { z } from 'zod';
import { FileType } from 'db';

const basicValidation = {
  name: z.string().min(5).max(30),
  description: z.string().max(100),
  categoryId: z.string().regex(/^((?!-1).)*$/, 'Field required')
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
