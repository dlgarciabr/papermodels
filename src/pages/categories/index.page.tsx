import { Suspense, useContext, useState, useEffect } from 'react';
import { RouterContext, Routes } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { invoke, useMutation } from '@blitzjs/rpc';
import Layout from 'src/core/layouts/Layout';
import getCategories from 'src/categories/queries/getCategories';
import deleteCategory from 'src/categories/mutations/deleteCategory';
import { Category } from '@prisma/client';

const ITEMS_PER_PAGE = 10;

export const CategoriesList = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const [hasMore, setHasMore] = useState(false);
  const router = useContext(RouterContext);
  const page = Number(router.query.page) || 0;

  const [deleteCategoryMutation] = useMutation(deleteCategory);

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });
  const goToEditPage = (id: number) => router.push(Routes.EditCategoryPage({ categoryId: id }));

  const loadCategories = async () => {
    const { categories, hasMore } = await invoke(getCategories, {
      orderBy: { name: 'asc' },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE
    });
    setCategories(categories);
    setHasMore(hasMore);
  };

  useEffect(() => {
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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
                /* istanbul ignore else -- @preserve */
                if (window.confirm('This category will be deleted')) {
                  await deleteCategoryMutation({ id: category.id });
                  void loadCategories();
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
