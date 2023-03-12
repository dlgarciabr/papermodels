import { paginate } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db, { Prisma } from 'db';

interface GetSystemParametersInput
  extends Pick<Prisma.SystemParameterFindManyArgs, 'where' | 'orderBy' | 'skip' | 'take'> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetSystemParametersInput) => {
    const {
      items: systemParameters,
      hasMore,
      nextPage,
      count
    } = await paginate({
      skip,
      take,
      count: () => db.systemParameter.count({ where }),
      query: (paginateArgs) => db.systemParameter.findMany({ ...paginateArgs, where, orderBy })
    });

    return {
      systemParameters,
      nextPage,
      hasMore,
      count
    };
  }
);
