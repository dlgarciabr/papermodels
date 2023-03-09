import { paginate } from 'blitz';
import { resolver } from '@blitzjs/rpc';
import db, { Prisma } from 'db';

interface GetIntegrationSetupsInput
  extends Pick<Prisma.IntegrationSetupFindManyArgs, 'where' | 'orderBy' | 'skip' | 'take'> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetIntegrationSetupsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: integrationSetups,
      hasMore,
      nextPage,
      count
    } = await paginate({
      skip,
      take,
      count: () => db.integrationSetup.count({ where }),
      query: (paginateArgs) => db.integrationSetup.findMany({ ...paginateArgs, where, orderBy })
    });

    return {
      integrationSetups,
      nextPage,
      hasMore,
      count
    };
  }
);
