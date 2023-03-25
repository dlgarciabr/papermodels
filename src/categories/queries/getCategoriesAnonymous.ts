import { paginate } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db, { ItemStatus, Prisma } from 'db';

interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, 'where' | 'orderBy' | 'skip' | 'take'> {}

export default resolver.pipe(async ({ where, orderBy, skip = 0, take = 100 }: GetCategoriesInput) => {
  const whereClause: Prisma.CategoryWhereInput = {
    ...where,
    AND: [
      {
        items: {
          every: {
            status: ItemStatus.enable
          }
        }
      },
      {
        items: {
          some: {
            id: {}
          }
        }
      }
    ]
  };
  const {
    items: categories,
    hasMore,
    nextPage,
    count
  } = await paginate({
    skip,
    take,
    count: () => db.category.count({ where: whereClause }),
    query: (paginateArgs) => db.category.findMany({ ...paginateArgs, where: whereClause, orderBy })
  });

  return {
    categories,
    nextPage,
    hasMore,
    count
  };
});
