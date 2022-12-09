import { resolver } from "@blitzjs/rpc"
import db from "db"
import { CreateQuestion } from "../validations"

export default resolver.pipe(resolver.zod(CreateQuestion), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const question = await db.question.create({
    data: {
      ...input,
      choices: { create: input.choices },
    },
  })

  return question
})
