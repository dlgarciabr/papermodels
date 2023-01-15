import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { CreateItemValidation } from '../validations';

export default resolver.pipe(resolver.zod(CreateItemValidation), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const item = await db.item.create({
    data: {
      ...input,
      categoryId: parseInt(input.categoryId),
      files: {
        create: input.files.map((file) => ({
          storagePath: file.storagePath,
          artifactType: file.artifactType,
          index: file.index
        }))
      }
    }
  });

  return item;
});
