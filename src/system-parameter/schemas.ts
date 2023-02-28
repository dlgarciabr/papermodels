import { z } from 'zod';

export const basicValidation = {
  key: z.string(),
  value: z.string()
};

export const CreateSystemParameterValidation = z.object({
  ...basicValidation
});

export const CreateSystemParametersValidation = z.array(CreateSystemParameterValidation);
