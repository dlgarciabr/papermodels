import { Suspense, useContext } from 'react';
import { RouterContext, Routes } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { useMutation, usePaginatedQuery } from '@blitzjs/rpc';
import Layout from 'src/core/layouts/Layout';
import getCategories from 'src/categories/queries/getCategories';
import deleteCategory from 'src/categories/mutations/deleteCategory';

const ITEMS_PER_PAGE = 10;

export const CategoriesList = () => {
  const router = useContext(RouterContext);
  const page = Number(router.query.page) || 0;
  const [{ categories, hasMore }] = usePaginatedQuery(getCategories, {
    orderBy: { id: 'asc' },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE
  });
  const [deleteCategoryMutation] = useMutation(deleteCategory);

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });
  const goToEditPage = (id: number) => router.push(Routes.EditCategoryPage({ categoryId: id }));

  return (
    <div>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={Routes.ShowCategoryPage({ categoryId: category.id })}>
              <a>{category.name}</a>
            </Link>
            <a href='#' onClick={() => goToEditPage(category.id)}>
              &nbsp;edit
            </a>
            <button
              type='button'
              onClick={async () => {
                if (window.confirm('This will be deleted')) {
                  await deleteCategoryMutation({ id: category.id });
                  await router.push(Routes.CategoriesPage());
                }
              }}
              style={{ marginLeft: '0.5rem' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  );
};

const CategoriesPage = () => {
  return (
    <Layout>
      <Head>
        <title>Categories</title>
      </Head>
      <div>
        <p>
          <Link href={Routes.NewCategoryPage()}>
            <a>Create Category</a>
          </Link>
        </p>
        <Suspense fallback={<div>Loading...</div>}>
          <CategoriesList />
        </Suspense>
      </div>
    </Layout>
  );
};

export default CategoriesPage;
