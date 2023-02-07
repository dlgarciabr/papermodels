import { z } from 'zod';

if (process.env.parentModel) {
  const basicValidation = {
    name: z.string().min(5).max(30),
    __parentModelId__: z.number()
  };
} else {
  const basicValidation = {
    name: z.string().min(5).max(30)
  };
}

export const Create__ModelName__Validation = z.object({
  ...basicValidation
});

export const Update__ModelName__Validation = z.object({
  id: z.number(),
  ...basicValidation
});
