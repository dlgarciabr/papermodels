import { Suspense, useState, useContext, memo } from 'react';
import { Routes, RouterContext } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery, useMutation } from '@blitzjs/rpc';
import { useParam } from '@blitzjs/next';

import Layout from 'src/core/layouts/Layout';
import getItem from 'src/items/queries/getItem';
import updateItem from 'src/items/mutations/updateItem';
import { ItemForm, FORM_ERROR } from 'src/items/components/ItemForm';
import { ARIA_ROLE } from 'test/ariaRoles'; // TODO remove from tests if this will be used outside test
import { downloadFile, getSimpleRandomKey } from 'src/utils/global';
import Dropzone from 'src/core/components/Dropzone';
import { saveItemFiles, uploadFiles } from '../utils';
import { UploadItemFile } from '../types';
import { Item, ItemFile } from 'db';
import createItemFile from 'src/items/mutations/createItemFile';

const renderFiles = (files: ItemFile[]) => {
  if (files.length) {
    return files.map((file: ItemFile & { url: string; item: Item }, index) => {
      return (
        <tr key={index}>
          <td>{file.id}</td>
          <td>{file.artifactType}</td>
          <td>
            <a href='#' onClick={() => downloadFile(file)}>
              Download
            </a>
          </td>
        </tr>
      );
    });
  } else {
    return 'No files found';
  }
};

export const EditItem = () => {
  const [filesToUpload, setFilesToUpload] = useState<UploadItemFile[]>([]);
  const [dropzoneKey, setDropzoneKey] = useState(getSimpleRandomKey());
  const router = useContext(RouterContext);
  const itemId = useParam('itemId', 'number') as number;
  const [item, { setQueryData }] = useQuery(
    getItem,
    { id: itemId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity
    }
  );
  const [updateItemMutation] = useMutation(updateItem);
  const [createItemFileMutation] = useMutation(createItemFile);

  const handleClickSaveFiles = async () => {
    await uploadFiles(filesToUpload);
    await saveItemFiles(filesToUpload, createItemFileMutation);
    alert('files saved');
    await setQueryData(item);
    resetDropzone();
    setFilesToUpload([]);
    // TODO
    // if an error occurred on db operation, try to remove file from storage
    // allow select file type before upload
    // allow select file after before upload
    // try to recover status from upload files
  };

  const handleFileDroped = (dropedFiles: UploadItemFile[]) => {
    const files = dropedFiles.map((file) => {
      file.item = item;
      return file;
    });
    setFilesToUpload(files);
  };

  const resetDropzone = () => {
    setDropzoneKey(getSimpleRandomKey());
  };

  return (
    <>
      <Head>
        <title>Edit Item {item.id}</title>
      </Head>

      <div>
        <h1>Edit Item {item.id}</h1>

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
                files: [] as ItemFile[],
                ...values
              });
              await setQueryData(updated as Item & { files: ItemFile[] });
              await router.push(Routes.ItemsPage());
            } catch (error: any) {
              console.error(error);
              return {
                [FORM_ERROR]: error.toString()
              };
            }
          }}
        />
        <section id='files' role={ARIA_ROLE.LANDMARK.CONTENTINFO}>
          <div>Files</div>
          <table>
            <tr>
              <td>Name</td>
              <td>Type</td>
              <td>Operation</td>
            </tr>
            {renderFiles(item.files)}
          </table>
        </section>
        <Dropzone onDropedFilesChange={handleFileDroped} key={dropzoneKey} />
        {filesToUpload.length > 0 ? (
          <p
            style={{
              color: 'red'
            }}>{`The selected files were not saved yet, to confirm press the button "Save files" below`}</p>
        ) : (
          ''
        )}
        <button disabled={filesToUpload.length === 0} onClick={handleClickSaveFiles}>
          Save files
        </button>
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
          <a>Back to List</a>
        </Link>
      </p>
    </div>
  );
};

EditItemPage.authenticate = true;
EditItemPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditItemPage;
