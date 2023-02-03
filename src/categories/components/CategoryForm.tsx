import { Form, FormProps } from 'src/core/components/Form';
import { LabeledTextField } from 'src/core/components/Form/LabeledTextField';
import { z } from 'zod';
export { FORM_ERROR } from 'src/core/components/Form';

export function CategoryForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField name='name' label='Name' placeholder='Name' maxLength={30} />
      <LabeledTextField name='description' label='Description' placeholder='Description' maxLength={100} />
    </Form>
  );
}
