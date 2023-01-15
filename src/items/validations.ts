import { z } from 'zod';
import { FileType } from 'db';

export const CreateItemValidation = z.object({
  name: z.string().min(5).max(30),
  description: z.string().max(100),
  categoryId: z.string().regex(/^((?!-1).)*$/, 'Field required'),
  files: z.array(
    z.object({
      storagePath: z.string(),
      artifactType: z.enum([FileType.scheme, FileType.instruction, FileType.preview]),
      index: z.number()
    })
  )
});
