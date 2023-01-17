import { Suspense, useState, useContext } from 'react';
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
import { sortFilesIndexes, saveItemFiles, uploadFiles } from '../utils';
import { UploadItemFile } from '../../../items/types';
import { Item, ItemFile } from 'db';
import createItemFile from 'src/items/mutations/createItemFile';
import { deleteFile } from 'src/utils/fileStorage';
import deleteItemFile from 'src/items/mutations/deleteItemFile';
import updateItemFile from 'src/items/mutations/updateItemFile';
import getCategories from 'src/categories/queries/getCategories';
import { UpdateItemValidation } from 'src/items/validations';

const Files = (props: { files: ItemFile[]; onClickDelete: (file: ItemFile) => void }) => {
  return (
    <section id='files' role={ARIA_ROLE.LANDMARK.CONTENTINFO}>
      <div>Files</div>
      <table>
        <tbody>
          <tr>
            <td>Name</td>
            <td>Type</td>
            <td>Operation</td>
          </tr>
          {props.files.length === 0 ? (
            <tr>
              <td colSpan={3}>No files found</td>
            </tr>
          ) : (
            props.files.map((file: ItemFile & { url: string; item: Item }) => {
              return (
                <tr key={file.id}>
                  <td>{file.storagePath}</td>
                  <td>{file.artifactType}</td>
                  <td>
                    <a href='#' onClick={() => downloadFile(file)}>
                      Download
                    </a>
                    <a href='#' onClick={() => props.onClickDelete(file)}>
                      Remove
                    </a>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </section>
  );
};

export const EditItem = () => {
  const [filesToUpload, setFilesToUpload] = useState<UploadItemFile[]>([]);
  const [dropzoneKey, setDropzoneKey] = useState(getSimpleRandomKey());
  const [isSaving, setSaving] = useState(false);
  // const [filesKey, setFilesKey] = useState(getSimpleRandomKey());
  const router = useContext(RouterContext);
  const itemId = useParam('itemId', 'number') as number;
  const [item, queryResult] = useQuery(
    getItem,
    { id: itemId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity
    }
  );

  const [categoryResult] = useQuery(
    getCategories,
    { orderBy: { name: 'asc' } },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity
    }
  );

  const [updateItemMutation] = useMutation(updateItem);
  const [updateItemFileMutation] = useMutation(updateItemFile);
  const [createItemFileMutation] = useMutation(createItemFile);
  const [deleteItemFileMutation] = useMutation(deleteItemFile);

  const handleClickSaveFiles = async () => {
    setSaving(true);
    const hasFileWithError = filesToUpload.some((file) => !file.artifactType);
    if (hasFileWithError) {
      alert('Chose a type for each file to be uploaded or remove the file from list');
      return;
    }
    try {
      await uploadFiles(filesToUpload);
      await saveItemFiles(filesToUpload, createItemFileMutation);
      alert('files saved');
      await queryResult.refetch();
      setDropzoneKey(getSimpleRandomKey());
      setFilesToUpload([]);
      setSaving(false);
    } catch (error) {
      // TODO show a friendly message to the user
      setSaving(false);
      throw new Error(error);
    }
  };

  const handleDeleteFile = async (file: ItemFile & { url: string; item: Item }) => {
    if (confirm(`are you sure to remove the file ${file.storagePath}`)) {
      await deleteFile(file.storagePath);
      await deleteItemFileMutation({ id: file.id });
      const remainingFiles = item.files.filter((itemFile) => itemFile.id !== file.id);
      await sortFilesIndexes(item, remainingFiles, updateItemFileMutation);
      await queryResult.refetch();
      alert('file removed');
    }
  };

  const handleFileDroped = (dropedFiles: UploadItemFile[]) => {
    const files = dropedFiles.map((file) => {
      file.item = item;
      return file;
    });
    setFilesToUpload(files);
  };

  const dropzoneOptions = {
    maxFiles: 5,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/svg+xml': ['.svg'],
      'application/pdf': ['.pdf']
    },
    validator: () => (filesToUpload.length >= 5 ? { code: 'too-many-files', message: 'too many files' } : null),
    onDropedFilesChange: handleFileDroped,
    validateFiles: isSaving
  };

  return (
    <>
      <Head>
        <title>Edit Item {item.id}</title>
      </Head>

      <div>
        <h1>Edit Item {item.name}</h1>

        <ItemForm
          submitText='Update Item'
          schema={UpdateItemValidation}
          initialValues={{
            ...item,
            categoryId: item.categoryId.toString(),
            assemblyTime: parseFloat(item.assemblyTime.toString()),
            author: item.author || '',
            authorLink: item.authorLink || '',
            licenseType: item.licenseType || '',
            licenseTypeLink: item.licenseTypeLink || ''
          }}
          categories={categoryResult.categories}
          onSubmit={async (values) => {
            try {
              const updated = await updateItemMutation({
                ...values
              });
              await queryResult.setQueryData(updated as Item & { files: ItemFile[] });
              await router.push(Routes.ItemsPage());
            } catch (error: any) {
              console.error(error);
              return {
                [FORM_ERROR]: error.toString()
              };
            }
          }}
        />
        <Files files={item.files} onClickDelete={handleDeleteFile} /* key={filesKey} */ />
        <Dropzone key={dropzoneKey} {...dropzoneOptions} />
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
