import { paginate } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db, { Prisma } from 'db';

interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, 'where' | 'orderBy' | 'skip' | 'take'> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetCategoriesInput) => {
    const {
      items: categories,
      hasMore,
      nextPage,
      count
    } = await paginate({
      skip,
      take,
      count: () => db.category.count({ where }),
      query: (paginateArgs) => db.category.findMany({ ...paginateArgs, where, orderBy })
    });

    return {
      categories,
      nextPage,
      hasMore,
      count
    };
  }
);
