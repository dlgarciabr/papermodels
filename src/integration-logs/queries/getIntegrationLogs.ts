import { paginate } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db, { Prisma } from 'db';

interface GetIntegrationLogsInput
  extends Pick<Prisma.IntegrationLogFindManyArgs, 'where' | 'orderBy' | 'skip' | 'take'> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetIntegrationLogsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: integrationLogs,
      hasMore,
      nextPage,
      count
    } = await paginate({
      skip,
      take,
      count: () => db.integrationLog.count({ where }),
      query: (paginateArgs) => db.integrationLog.findMany({ ...paginateArgs, where, orderBy })
    });

    return {
      integrationLogs,
      nextPage,
      hasMore,
      count
    };
  }
);
