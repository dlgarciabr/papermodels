import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { CreateItemValidation } from '../schemas';

export default resolver.pipe(resolver.zod(CreateItemValidation), resolver.authorize(), async (input) => {
  const item = await db.item.create({
    data: {
      ...input,
      categoryId: parseInt(input.categoryId),
      files: {
        create: input.files.map((file) => ({
          storagePath: file.storagePath,
          artifactType: file.artifactType
        }))
      }
    }
  });

  return item;
});
