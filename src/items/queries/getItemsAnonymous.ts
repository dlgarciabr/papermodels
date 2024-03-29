import { paginate } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db, { ItemStatus, Prisma } from 'db';

interface GetItemsInput extends Pick<Prisma.ItemFindManyArgs, 'where' | 'orderBy' | 'skip' | 'take' | 'include'> {}

export default resolver.pipe(async ({ where, orderBy, skip = 0, take = 100 }: GetItemsInput) => {
  const whereClause: Prisma.ItemWhereInput = {
    AND: [
      {
        status: ItemStatus.enable
      }
    ]
  };

  const containsExpression = !!where?.name;
  const containsCategory = !!where?.categoryId;

  if (containsExpression) {
    (whereClause.AND! as any).push({
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
    });
  } else if (containsCategory) {
    (whereClause.AND! as any).push({
      categoryId: where?.categoryId
    });
  }

  const { items, hasMore, nextPage, count } = await paginate({
    skip,
    take,
    count: () => db.item.count({ where: whereClause }),
    query: (paginateArgs) =>
      db.item.findMany({
        ...paginateArgs,
        where: whereClause,
        orderBy,
        include: {
          files: true
        }
      })
  });

  return {
    items,
    nextPage,
    hasMore,
    count
  };
});
