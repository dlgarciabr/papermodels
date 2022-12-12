import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { usePaginatedQuery } from "@blitzjs/rpc";
import { useRouter } from "next/router";
import Layout from "src/core/layouts/Layout";
import getCategories from "src/categories/queries/getCategories";

const ITEMS_PER_PAGE = 100;

export const CategoriesList = () => {
  const router = useRouter();
  const page = Number(router.query.page) || 0;
  const [{ categories, hasMore }] = usePaginatedQuery(getCategories, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  });

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });

  return (
    <div>
      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            <Link href={Routes.ShowCategoryPage({ categoryId: category.id })}>
              <a>{category.name}</a>
            </Link>
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
