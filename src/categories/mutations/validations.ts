import { z } from 'zod';

const basicValidation = {
  name: z.string().min(5).max(30),
  description: z.string().max(100)
};

export const CreateCategoryValidation = z.object({
  ...basicValidation
});

export const UpdateCategoryValidation = z.object({
  id: z.number(),
  ...basicValidation
});
