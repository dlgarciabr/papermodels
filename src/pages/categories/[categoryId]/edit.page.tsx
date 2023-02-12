import { Suspense, useContext } from 'react';
import { Routes, RouterContext } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation } from '@blitzjs/rpc';
import { useParam } from '@blitzjs/next';

import Layout from 'src/core/layouts/Layout';
import getCategory from 'src/categories/queries/getCategory';
import updateCategory from 'src/categories/mutations/updateCategory';
import { CategoryForm, FORM_ERROR } from 'src/categories/components/CategoryForm';
import { showToast } from 'src/core/components/Toast';
import { ToastType } from 'src/core/components/Toast/types.d';
import { UpdateCategoryValidation } from 'src/categories/schemas';

export const EditCategory = () => {
  const router = useContext(RouterContext);
  const categoryId = useParam('categoryId', 'number');
  const [category, { setQueryData }] = useQuery(
    getCategory,
    { id: categoryId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity
    }
  );
  const [updateCategoryMutation] = useMutation(updateCategory);

  return (
    <>
      <Head>
        <title>Edit Category {category.id}</title>
      </Head>

      <div>
        <h1>Edit Category {category.id}</h1>

        <CategoryForm
          submitText='Update Category'
          schema={UpdateCategoryValidation}
          initialValues={category}
          onSubmit={async (values) => {
            try {
              const updated = await updateCategoryMutation({
                ...values
              });
              showToast(ToastType.SUCCESS, 'Category successfully updated!');
              await setQueryData(updated);
              await router.push(Routes.CategoriesPage());
            } catch (error: any) {
              console.error(error);
              return {
                [FORM_ERROR]: error.toString()
              };
            }
          }}
        />
      </div>
    </>
  );
};

const EditCategoryPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditCategory />
      </Suspense>

      <p>
        <Link href={Routes.CategoriesPage()}>
          <a>Back to list</a>
        </Link>
      </p>
    </div>
  );
};

EditCategoryPage.authenticate = { redirectTo: '/admin' };
EditCategoryPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditCategoryPage;
