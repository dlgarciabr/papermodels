import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "src/core/layouts/Layout"
import createQuestion from "src/questions/mutations/createQuestion"
import { QuestionForm, FORM_ERROR } from "src/questions/components/QuestionForm"
import { CreateQuestion } from "src/questions/validations"

const NewQuestionPage = () => {
  const router = useRouter()
  const [createQuestionMutation] = useMutation(createQuestion)

  return (
    <Layout title={"Create New Question"}>
      <h1>Create New Question</h1>

      <QuestionForm
        submitText="Create Question"
        schema={CreateQuestion}
        initialValues={{ text: "", choices: [] }}
        onSubmit={async (values) => {
          try {
            const question = await createQuestionMutation(values)
            await router.push(Routes.ShowQuestionPage({ questionId: question.id }))
          } catch (error: any) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.QuestionsPage()}>
          <a>Questions</a>
        </Link>
      </p>
    </Layout>
  )
}

NewQuestionPage.authenticate = true

export default NewQuestionPage
