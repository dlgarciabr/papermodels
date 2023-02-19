import { z } from 'zod';

const basicValidation = {
  name: z.string(),
  key: z.string(),
  domain: z.string(),
  itemUrlSelector: z.string(),
  previewImagesSelector: z.string(),
  categorySelector: z.string(),
  categoryBinding: z.string(),
  schemesSelector: z.string()
};

export const CreateIntegrationSetupValidation = z.object({
  ...basicValidation
});

export const UpdateIntegrationSetupValidation = z.object({
  ...basicValidation,
  id: z.number()
});
