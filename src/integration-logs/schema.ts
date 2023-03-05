import { z } from 'zod';

const basicValidation = {
  integrationId: z.number().nullish(),
  key: z.string(),
  reference: z.string(),
  value: z.string(),
  error: z.string().nullish()
};

export const CreateIntegrationLogValidation = z.object({
  ...basicValidation
});
