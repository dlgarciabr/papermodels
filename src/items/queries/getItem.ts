import { NotFoundError } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';
import { getFilePath } from 'src/utils/fileStorage';

const GetItem = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, 'Required')
});

export default resolver.pipe(resolver.zod(GetItem), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const item = await db.item.findFirst({
    where: { id },
    include: { files: true }
  });

  if (!item) throw new NotFoundError();

  const promises = item.files.map(async (file) => {
    const url = await getFilePath(file.id);
    (file as any).url = url;
  });

  await Promise.all(promises);

  return item;
});
