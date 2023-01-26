import { Suspense, useContext, useState, useEffect } from 'react';
import { RouterContext, Routes } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { invoke, useMutation } from '@blitzjs/rpc';
import Layout from 'src/core/layouts/Layout';
import getItems from 'src/items/queries/getItems';
import deleteItem from 'src/items/mutations/deleteItem';
import { Item } from '@prisma/client';
import { showToast } from 'src/core/components/Toast';
import { ToastType } from 'src/core/components/Toast/types.d';

const ITEMS_PER_PAGE = 10;

export const ItemsList = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const router = useContext(RouterContext);
  const page = Number(router.query.page) || 0;

  const [deleteItemMutation] = useMutation(deleteItem);

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });
  const goToEditPage = (id: number) => router.push(Routes.EditItemPage({ itemId: id }));

  const loadItems = async () => {
    const { items, hasMore } = await invoke(getItems, {
      orderBy: { name: 'asc' },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE
    });
    setItems(items);
    setHasMore(hasMore);
  };

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name}
            <a href='#' onClick={() => goToEditPage(item.id)}>
              &nbsp;edit
            </a>
            <button
              type='button'
              onClick={async () => {
                /* istanbul ignore else -- @preserve */
                if (window.confirm('This item will be deleted')) {
                  await deleteItemMutation({ id: item.id });
                  showToast(ToastType.SUCCESS, 'Item successfully removed!');
                  void loadItems();
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

const ItemsPage = () => {
  return (
    <Layout>
      <Head>
        <title>Items</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewItemPage()}>
            <a>Create Item</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <ItemsList />
        </Suspense>
      </div>
    </Layout>
  );
};

ItemsPage.authenticate = { redirectTo: '/admin' };

export default ItemsPage;
