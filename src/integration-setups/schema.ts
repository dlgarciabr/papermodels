import { z } from 'zod';

const basicValidation = {
  name: z.string(),
  key: z.string(),
  domain: z.string(),
  itemUrlSelector: z.string(),
  previewImagesSelector: z.string(),
  categorySelector: z.string(),
  categoryBinding: z.string(),
  schemesSelector: z.string(),
  descriptionSelector: z.string().nullish(),
  author: z.string().nullish(),
  authorLink: z.string().nullish(),
  licenseType: z.string().nullish(),
  licenseTypeLink: z.string().nullish()
};

export const CreateIntegrationSetupValidation = z.object({
  ...basicValidation
});

export const UpdateIntegrationSetupValidation = z.object({
  ...basicValidation,
  id: z.number()
});
