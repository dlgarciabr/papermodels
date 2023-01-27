import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { CreateItemFileValidation } from '../validations';

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
