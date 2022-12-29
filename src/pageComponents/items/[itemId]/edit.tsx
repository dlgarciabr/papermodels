import { Suspense } from 'react';
import { Routes } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@blitzjs/rpc';
import { useParam } from '@blitzjs/next';

import Layout from 'src/core/layouts/Layout';
import getItem from 'src/items/queries/getItem';
import updateItem from 'src/items/mutations/updateItem';
import { ItemForm, FORM_ERROR } from 'src/items/components/ItemForm';

export const EditItem = () => {
  const router = useRouter();
  const itemId = useParam('itemId', 'number');
  const [item, { setQueryData }] = useQuery(
    getItem,
    { id: itemId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity
    }
  );
  const [updateItemMutation] = useMutation(updateItem);

  return (
    <>
      <Head>
        <title>Edit Item {item.id}</title>
      </Head>

      <div>
        <h1>Edit Item {item.id}</h1>
        <pre>{JSON.stringify(item, null, 2)}</pre>

        <ItemForm
          submitText='Update Item'
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateItem}
          initialValues={item}
          onSubmit={async (values) => {
            try {
              const updated = await updateItemMutation({
                id: item.id,
                ...values
              });
              await setQueryData(updated);
              await router.push(Routes.ItemsPage());
            } catch (error: any) {
              console.error(error);
              return {
                [FORM_ERROR]: error.toString()
              };
            }
          }}
        />
        <div>
          <div>Files</div>
          <table>
            <tr>
              <td>Name</td>
              <td>Type</td>
              <td>Operation</td>
            </tr>
            {item.files.map((file, index) => (
              <tr key={index}>
                <td>{file.id}</td>
              </tr>
            ))}
          </table>
        </div>
      </div>
    </>
  );
};

const EditItemPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditItem />
      </Suspense>

      <p>
        <Link href={Routes.ItemsPage()}>
          <a>Items</a>
        </Link>
      </p>
    </div>
  );
};

EditItemPage.authenticate = true;
EditItemPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditItemPage;
