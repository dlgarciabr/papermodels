import { Suspense } from 'react';
import { Routes } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@blitzjs/rpc';
import { useParam } from '@blitzjs/next';

import Layout from 'src/core/layouts/Layout';
import get__ModelName__ from 'src/__modelNamesPath__/queries/get__ModelName__';
import update__ModelName__ from 'src/__modelNamesPath__/mutations/update__ModelName__';
import { __ModelName__Form, FORM_ERROR } from 'src/__modelNamesPath__/components/__ModelName__Form';
import { showToast } from 'src/core/components/Toast';
import { ToastType } from 'src/core/components/Toast/types.d';

export const Edit__ModelName__ = () => {
  const router = useRouter();
  const __modelId__ = useParam('__modelId__', 'number');
  if (process.env.parentModel) {
    const __parentModelId__ = useParam('__parentModelId__', 'number');
  }
  const [__modelName__, { setQueryData }] = useQuery(
    get__ModelName__,
    { id: __modelId__ },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity
    }
  );
  const [update__ModelName__Mutation] = useMutation(update__ModelName__);

  return (
    <>
      <Head>
        <title>Edit __ModelName__ {__modelName__.id}</title>
      </Head>

      <div>
        <h1>Edit __ModelName__ {__modelName__.id}</h1>

        <__ModelName__Form
          submitText='Update __ModelName__'
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={Update__ModelName__}
          initialValues={__modelName__}
          onSubmit={async (values) => {
            try {
              const updated = await update__ModelName__Mutation({
                id: __modelName__.id,
                ...values
              });
              showToast(ToastType.SUCCESS, '__ModelName__ successfully updated!');
              await setQueryData(updated);
              await router.push(Routes.__ModelNames__Page());
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

const Edit__ModelName__Page = () => {
  if (process.env.parentModel) {
    const __parentModelId__ = useParam('__parentModelId__', 'number');
  }

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Edit__ModelName__ />
      </Suspense>

      <p>
        <if condition='parentModel'>
          <Link href={Routes.__ModelNames__Page({ __parentModelId__: __parentModelId__! })}>
            <a>__ModelNames__</a>
          </Link>
          <else>
            <Link href={Routes.__ModelNames__Page()}>
              <a>Back to list</a>
            </Link>
          </else>
        </if>
      </p>
    </div>
  );
};

Edit__ModelName__Page.authenticate = true;
Edit__ModelName__Page.getLayout = (page) => <Layout>{page}</Layout>;

export default Edit__ModelName__Page;
