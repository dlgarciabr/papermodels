import { z } from 'zod';

export const CreateCategoryValidation = z.object({
  name: z.string().min(5).max(30),
  description: z.string().max(100)
});
