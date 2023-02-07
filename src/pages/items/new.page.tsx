import { useContext, useEffect, useState } from 'react';
import { Routes, RouterContext } from '@blitzjs/next';
import Link from 'next/link';
import { invoke, useMutation } from '@blitzjs/rpc';

import Layout from 'src/core/layouts/Layout';
import createItem from 'src/items/mutations/createItem';
import { ItemForm, FORM_ERROR } from 'src/items/components/ItemForm';
import getCategories from 'src/categories/queries/getCategories';
import { Category } from 'db';
import { CreateItemValidation } from 'src/items/mutations/validations';
import { ToastType } from 'src/core/components/Toast/types.d';
import { showToast } from 'src/core/components/Toast';

const NewItemPage = () => {
  const router = useContext(RouterContext);
  const [createItemMutation] = useMutation(createItem);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    const { categories } = await invoke(getCategories, {
      orderBy: { name: 'asc' }
    });
    setCategories(categories);
  };

  useEffect(() => void loadCategories(), []);

  return (
    <Layout title={'Create New Item'}>
      <h1>Create New Item</h1>

      <ItemForm
        submitText='Create Item'
        schema={CreateItemValidation}
        initialValues={{
          categoryId: '-1',
          description: '',
          name: '',
          files: [],
          assemblyTime: 0,
          dificulty: 0,
          author: '',
          authorLink: '',
          licenseType: '',
          licenseTypeLink: ''
        }}
        categories={categories}
        onSubmit={async (values) => {
          try {
            await createItemMutation({
              ...values,
              files: []
            });
            showToast(ToastType.SUCCESS, 'Item successfully created!');
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

NewItemPage.authenticate = { redirectTo: '/admin' };

export default NewItemPage;
