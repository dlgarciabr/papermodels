import { paginate } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db, { FileType, Prisma } from 'db';

interface GetItemsInput extends Pick<Prisma.ItemFindManyArgs, 'where' | 'orderBy' | 'skip' | 'take' | 'include'> {}

export default resolver.pipe(async ({ where, orderBy, skip = 0, take = 100 }: GetItemsInput) => {
  const { items, hasMore, nextPage, count } = await paginate({
    skip,
    take,
    count: () => db.item.count({ where }),
    query: (paginateArgs) =>
      db.item.findMany({
        ...paginateArgs,
        where: {
          name: { contains: (where?.name as any).contains.expression }
        },
        orderBy,
        include: {
          files: {
            where: {
              artifactType: { equals: FileType.thumbnail }
            }
          }
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
