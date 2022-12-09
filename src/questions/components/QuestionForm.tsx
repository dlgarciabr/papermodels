import { Form, FormProps } from "src/core/components/Form"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/Form"

export function QuestionForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField name="text" label="Text" placeholder="Text" />
      {props.initialValues?.choices?.map((choice, index) => (
        <LabeledTextField
          key={index}
          name={`choices.${index}.text`}
          label={`Choice ${index + 1}`}
        />
      ))}
    </Form>
  )
}
