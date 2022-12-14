import { resolver } from "@blitzjs/rpc";
import db from "db";
import { z } from "zod";

const CreateCategory = z.object({
  name: z.string(),
  description: z.string(),
});

export default resolver.pipe(resolver.zod(CreateCategory), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const category = await db.category.create({ data: input });

  return category;
});
