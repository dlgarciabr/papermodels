import { Category } from 'db';
import { Form, FormProps } from 'src/core/components/Form';
import LabeledSelect from 'src/core/components/LabeledSelect';
import { LabeledTextField } from 'src/core/components/LabeledTextField';
import { z } from 'zod';
export { FORM_ERROR } from 'src/core/components/Form';

export function ItemForm<S extends z.ZodType<any, any>>(props: FormProps<S> & { categories: Category[] }) {
  const selectCategoryItems = props.categories
    ? props.categories.map((category) => ({ value: category.id, label: category.name }))
    : [];
  const categoryDisabled = selectCategoryItems.length === 0;
  return (
    <Form<S> {...props}>
      <LabeledTextField name='name' label='Name' placeholder='Name' />
      <LabeledTextField name='description' label='Description' placeholder='Description' />
      <LabeledSelect
        name='category'
        label='Category'
        placeholder='Chose one...'
        items={selectCategoryItems}
        disabled={categoryDisabled}
      />
    </Form>
  );
}
