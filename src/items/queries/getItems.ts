import { paginate } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db, { Prisma } from 'db';

interface GetItemsInput extends Pick<Prisma.ItemFindManyArgs, 'where' | 'orderBy' | 'skip' | 'take' | 'include'> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100, include }: GetItemsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const { items, hasMore, nextPage, count } = await paginate({
      skip,
      take,
      count: () => db.item.count({ where }),
      query: (paginateArgs) =>
        db.item.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include
        })
    });

    return {
      items,
      nextPage,
      hasMore,
      count
    };
  }
);
