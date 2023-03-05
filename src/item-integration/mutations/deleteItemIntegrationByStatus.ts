import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { z } from 'zod';
import { zItemIntegrationStatusEnum } from '../schemas';

const DeleteItemIntegration = z.object({
  status: zItemIntegrationStatusEnum
});

export default resolver.pipe(resolver.zod(DeleteItemIntegration), resolver.authorize(), async ({ status }) => {
  const itemIntegration = await db.itemIntegration.deleteMany({ where: { status } });
  return itemIntegration;
});
