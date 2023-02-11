import { useContext } from 'react';
import { Routes, RouterContext } from '@blitzjs/next';
import Link from 'next/link';
import { useMutation } from '@blitzjs/rpc';
import { showToast } from 'src/core/components/Toast';
import Layout from 'src/core/layouts/Layout';
import createCategory, { CreateCategoryValidation } from 'src/categories/mutations/createCategory';
import { CategoryForm, FORM_ERROR } from 'src/categories/components/CategoryForm';
import { ToastType } from 'src/core/components/Toast/types.d';

const NewCategoryPage = () => {
  const router = useContext(RouterContext);
  const [createCategoryMutation] = useMutation(createCategory);

  return (
    <Layout title={'Create New Category'}>
      <h1>Create New Category</h1>

      <CategoryForm
        submitText='Create Category'
        schema={CreateCategoryValidation}
        initialValues={{ name: '', description: '' }}
        onSubmit={async (values) => {
          try {
            await createCategoryMutation(values);
            showToast(ToastType.SUCCESS, 'Category successfully created!');
            await router.push(Routes.CategoriesPage());
          } catch (error: any) {
            console.error('error', error);
            return {
              [FORM_ERROR]: error.toString()
            };
          }
        }}
      />

      <p>
        <Link href={Routes.CategoriesPage()}>
          <a>Categories</a>
        </Link>
      </p>
    </Layout>
  );
};

NewCategoryPage.authenticate = { redirectTo: '/admin' };

export default NewCategoryPage;
