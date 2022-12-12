import { Form, FormProps } from "src/core/components/Form";
import { LabeledTextField } from "src/core/components/LabeledTextField";
import { z } from "zod";
export { FORM_ERROR } from "src/core/components/Form";

export function ItemForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField name="name" label="Name" placeholder="Name" />
      <LabeledTextField name="description" label="Description" placeholder="Description" />
      <LabeledTextField name="categoryId" label="categoryId" placeholder="categoryId" />
      {/* <select name="categoryId" placeholder="Category">
        <option></option>
        <option value="1">cate1</option>
      </select> */}
    </Form>
  );
}
