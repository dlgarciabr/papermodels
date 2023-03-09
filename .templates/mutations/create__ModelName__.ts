import { resolver } from '@blitzjs/rpc';
import db from 'db';
import { Create__ModelName__Validation } from './validations';

export default resolver.pipe(resolver.zod(Create__ModelName__Validation), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const __modelName__ = await db.__modelName__.create({ data: input });
  return __modelName__;
});
