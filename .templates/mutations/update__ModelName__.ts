import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { Update__ModelName__Validation } from './validations';

export default resolver.pipe(
  resolver.zod(Update__ModelName__Validation),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const __modelName__ = await db.__modelName__.update({ where: { id }, data });
    return __modelName__;
  }
);
