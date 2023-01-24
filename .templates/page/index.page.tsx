import { Suspense, useContext, useState, useEffect } from 'react';
import { RouterContext, Routes } from '@blitzjs/next';
import { invoke, useMutation } from '@blitzjs/rpc';
import Link from 'next/link';
import Head from 'next/head';
if (process.env.parentModel) {
  import { useParam } from '@blitzjs/next';
}
import Layout from 'src/core/layouts/Layout';
import get__ModelNames__ from 'src/__modelNamesPath__/queries/get__ModelNames__';
import delete__ModelName__ from 'src/__modelNamesPath__/mutations/delete__ModelName__';
import { __ModelName__ } from '@prisma/client';

const ITEMS_PER_PAGE = 10;

export const __ModelNames__List = () => {
  const [__modelNames__, set__ModelNames__] = useState<__ModelName__[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const router = useContext(RouterContext);
  const page = Number(router.query.page) || 0;
  const [delete__ModelName__Mutation] = useMutation(delete__ModelName__);

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } });
  const goToNextPage = () => router.push({ query: { page: page + 1 } });
  const goToEditPage = (id: number) => router.push(Routes.Edit__ModelName__Page({ __modelId__: id }));

  const load__ModelNames__ = async () => {
    const { __modelNames__, hasMore } = await invoke(get__ModelNames__, {
      orderBy: { id: 'asc' },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE
    });
    set__ModelNames__(__modelNames__);
    setHasMore(hasMore);
  };

  useEffect(() => {
    void load__ModelNames__();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  if (process.env.parentModel) {
    const __parentModelId__ = useParam('__parentModelId__', 'number');

    return (
      <div>
        <ul>
          {__modelNames__.map((__modelName__) => (
            <li key={__modelName__.id}>
              <Link href={Routes.Show__ModelName__Page({ __modelId__: __modelName__.id })}>
                <a>{__modelName__.name}</a>
              </Link>
              <a href='#' onClick={() => goToEditPage(__modelId__.id)}>
                &nbsp;edit
              </a>
              <button
                type='button'
                onClick={async () => {
                  if (window.confirm('This __modelName__ will be deleted')) {
                    await delete__ModelName__Mutation({ id: __modelName__.id });
                    void load__ModelNames__();
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
  } else {
    return (
      <div>
        <ul>
          {__modelNames__.map((__modelName__) => (
            <li key={__modelName__.id}>
              <if condition='parentModel'>
                <Link
                  href={Routes.Show__ModelName__Page({
                    __parentModelId__: __parentModelId__!,
                    __modelId__: __modelName__.id
                  })}>
                  <a>{__modelName__.name}</a>
                </Link>
                <else>
                  <a>{__modelName__.name}</a>
                  <a href='#' onClick={() => goToEditPage(__modelId__.id)}>
                    &nbsp;edit
                  </a>
                  <button
                    type='button'
                    onClick={async () => {
                      if (window.confirm('This __modelName__ will be deleted')) {
                        await delete__ModelName__Mutation({ id: __modelName__.id });
                        void load__ModelNames__();
                      }
                    }}
                    style={{ marginLeft: '0.5rem' }}>
                    Delete
                  </button>
                </else>
              </if>
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
  }
};

const __ModelNames__Page = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam('__parentModelId__', 'number');
  }

  return (
    <Layout>
      <Head>
        <title>__ModelNames__</title>
      </Head>

      <div>
        <p>
          <if condition='parentModel'>
            <Link href={Routes.New__ModelName__Page({ __parentModelId__: __parentModelId__! })}>
              <a>Create __ModelName__</a>
            </Link>
            <else>
              <Link href={Routes.New__ModelName__Page()}>
                <a>Create __ModelName__</a>
              </Link>
            </else>
          </if>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <__ModelNames__List />
        </Suspense>
      </div>
    </Layout>
  );
};

export default __ModelNames__Page;
