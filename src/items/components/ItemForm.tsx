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
      <LabeledTextField name='name' label='Name' placeholder='Name' maxLength={30} />
      <LabeledTextField name='description' label='Description' placeholder='Description' maxLength={100} />
      <LabeledTextField
        name='assemblyTime'
        label='Assembly time'
        placeholder='Assembly time'
        type='number'
        maxLength={100}
        step={0.5}
      />
      <LabeledTextField name='dificulty' label='Dificulty' placeholder='Dificulty' type='number' maxLength={100} />
      <LabeledSelect
        name='categoryId'
        label='Category'
        placeholder='Chose one...'
        items={selectCategoryItems}
        disabled={categoryDisabled}
      />
      <LabeledTextField name='author' label='Author' placeholder='Author' maxLength={50} />
      <LabeledTextField name='authorLink' label='Author Url' placeholder='Author Url' maxLength={100} />
      <LabeledTextField name='licenseType' label='License Type' placeholder='License Type' maxLength={50} />
      <LabeledTextField
        name='licenseTypeLink'
        label='License Type Url'
        placeholder='License Type Url'
        maxLength={200}
      />
    </Form>
  );
}
