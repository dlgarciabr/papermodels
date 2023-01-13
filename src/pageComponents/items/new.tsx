import { useContext } from 'react';
import { Routes, RouterContext } from '@blitzjs/next';
import Link from 'next/link';
import { useMutation, useQuery } from '@blitzjs/rpc';
import Layout from 'src/core/layouts/Layout';
import createItem from 'src/items/mutations/createItem';
import { ItemForm, FORM_ERROR } from 'src/items/components/ItemForm';
import getCategories from 'src/categories/queries/getCategories';

const NewItemPage = () => {
  const router = useContext(RouterContext);
  const [createItemMutation] = useMutation(createItem);
  const [categoryResult] = useQuery(
    getCategories,
    { orderBy: { name: 'asc' } },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity
    }
  );

  return (
    <Layout title={'Create New Item'}>
      <h1>Create New Item</h1>

      <ItemForm
        submitText='Create Item'
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateItem}
        initialValues={{}}
        categories={categoryResult.categories}
        onSubmit={async (values) => {
          try {
            const item = await createItemMutation({
              ...values,
              categoryId: new Number(values.categoryId),
              files: []
            });
            await router.push(Routes.ItemsPage());
          } catch (error: any) {
            console.error(error);
            return {
              [FORM_ERROR]: error.toString()
            };
          }
        }}
      />

      <p>
        <Link href={Routes.ItemsPage()}>
          <a>Items</a>
        </Link>
      </p>
    </Layout>
  );
};

NewItemPage.authenticate = true;

export default NewItemPage;
