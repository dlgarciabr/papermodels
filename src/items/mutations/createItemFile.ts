import { resolver } from '@blitzjs/rpc';
import db, { FileType } from 'db';
import { z } from 'zod';

export const zFileTypeEnum = z.enum([FileType.instruction, FileType.preview, FileType.scheme, FileType.thumbnail]);

export const basicItemFileValidation = {
  storagePath: z.string(),
  artifactType: zFileTypeEnum,
  itemId: z.number(),
  index: z.number()
};

export const CreateItemFileValidation = z.object({
  ...basicItemFileValidation
});

export default resolver.pipe(resolver.zod(CreateItemFileValidation), resolver.authorize(), async (input) => {
  const item = await db.itemFile.create({
    data: {
      storagePath: input.storagePath,
      artifactType: input.artifactType,
      itemId: input.itemId,
      index: input.index
    }
  });

  return item;
});
