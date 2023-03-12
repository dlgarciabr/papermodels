import { resolver } from '@blitzjs/rpc';
import db, { ItemStatus, Prisma } from 'db';

interface GetItemsInput extends Pick<Prisma.ItemFindManyArgs, 'where'> {}

export default resolver.pipe(async ({ where }: GetItemsInput) => {
  let whereClause: Prisma.ItemWhereInput = {};
  if (where && Object.keys(where).length > 0) {
    whereClause = {
      AND: [
        {
          status: ItemStatus.enable
        },
        {
          OR: [
            {
              name: {
                contains: (where?.name as Prisma.StringFilter).contains,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: (where?.name as Prisma.StringFilter).contains,
                mode: 'insensitive'
              }
            },
            {
              category: {
                name: {
                  contains: (where?.name as Prisma.StringFilter).contains,
                  mode: 'insensitive'
                }
              }
            }
          ]
        }
      ]
    };
  }
  return await db.item.count({ where: whereClause });
});
