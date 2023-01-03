import { Suspense, useCallback } from 'react';
import { Routes } from '@blitzjs/next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@blitzjs/rpc';
import { useParam } from '@blitzjs/next';
import { useDropzone } from 'react-dropzone';

import Layout from 'src/core/layouts/Layout';
import getItem from 'src/items/queries/getItem';
import updateItem from 'src/items/mutations/updateItem';
import { ItemForm, FORM_ERROR } from 'src/items/components/ItemForm';
import { ARIA_ROLE } from 'test/ariaRoles'; // TODO remove from tests if this will be used outside test
import { downloadFile } from 'src/utils/global';
import Dropzone from 'src/core/components/Dropzone';

const renderFiles = (files) => {
  if (files.length) {
    return files.map((file, index) => {
      return (
        <tr key={index}>
          <td>{file.id}</td>
          <td>{file.type}</td>
          <td>
            <a href='#' onClick={() => downloadFile(file.id, file.url)}>
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
      </div>
    </>
  );
};

// const Dropzone = () => {
//   const [files, setFiles] = useState<File[]>([]);
//   const onDrop = acceptedFiles => {
//     const filesToAdd = acceptedFiles.map(file => Object.assign(file, {
//       preview: URL.createObjectURL(file)
//     }));
//     const newFileList = [...filesToAdd, ...files];
//     setFiles(newFileList);
//   };

//   const options = {
//     onDrop,
//     maxFiles: 5,
//     accept: {
//       'image/png': ['.png'],
//       'image/jpeg': ['.jpeg, .jpg'],
//       'image/svg+xml': ['.svg'],
//       'application/pdf': ['.pdf']
//     }
//   };

//   const { getRootProps, getInputProps, isFocused,
//     isDragAccept, isDragReject } = useDropzone(options);

//   // TODO remove after defined styling method
//   const baseStyle = {
//     flex: 1,
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     padding: '20px',
//     borderWidth: 2,
//     borderRadius: 2,
//     borderColor: '#eeeeee',
//     borderStyle: 'dashed',
//     backgroundColor: '#fafafa',
//     color: '#bdbdbd',
//     outline: 'none',
//     transition: 'border .24s ease-in-out'
//   };

//   // TODO remove after defined styling method
//   const focusedStyle = {
//     borderColor: '#2196f3'
//   };

//   // TODO remove after defined styling method
//   const acceptStyle = {
//     borderColor: '#00e676'
//   };

//   // TODO remove after defined styling method
//   const rejectStyle = {
//     borderColor: '#ff1744'
//   };

//   // TODO remove after defined styling method
//   const thumbsContainer = {
//     display: 'flex',
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 16
//   };

//   // TODO remove after defined styling method
//   const thumb = {
//     display: 'inline-flex',
//     borderRadius: 2,
//     border: '1px solid #eaeaea',
//     marginBottom: 8,
//     marginRight: 8,
//     width: 100,
//     height: 100,
//     padding: 4,
//     boxSizing: 'border-box'
//   };

//   // TODO remove after defined styling method
//   const thumbInner = {
//     display: 'flex',
//     minWidth: 0,
//     overflow: 'hidden'
//   };

//   // TODO remove after defined styling method
//   const img = {
//     display: 'block',
//     width: 'auto',
//     height: '100%'
//   };

//   const style = useMemo(() => ({
//     ...baseStyle,
//     ...(isFocused ? focusedStyle : {}),
//     ...(isDragAccept ? acceptStyle : {}),
//     ...(isDragReject ? rejectStyle : {})
//   }), [
//     isFocused,
//     isDragAccept,
//     isDragReject
//   ]);

//   useEffect(() => {
//     // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
//     return () => files.forEach(file => URL.revokeObjectURL(file.preview));
//   }, []);

//   const thumbs = files.map((file: File) => (
//     <div key={file.name}>
//       <div style={thumb} key={file.name}>
//         <div style={thumbInner}>
//           {file.type === 'application/pdf' ?
//             'pdf file' :
//             <img
//               src={file.preview}
//               style={img}
//               // Revoke data uri after image is loaded
//               onLoad={() => { URL.revokeObjectURL(file.preview) }}
//             />
//           }
//         </div>
//       </div>
//       <div>{file.name}</div>
//     </div>
//   ));

//   // const acceptedFileItems = acceptedFiles.map(file => (
//   //   <li key={file.name}>
//   //     {file.name} - {file.size} bytes
//   //   </li>
//   // ));

//   // const fileRejectionItems = fileRejections.map(({ file, errors }) => {
//   //   return (
//   //     <li key={file.name}>
//   //       {file.name} - {file.size} bytes
//   //       <ul>
//   //         {errors.map(e => <li key={e.code}>{e.message}</li>)}
//   //       </ul>
//   //     </li>
//   //   )
//   // });

//   return (
//     <section className="container">
//       <div {...getRootProps({ className: 'dropzone', style })}>
//         <input {...getInputProps()} />
//         <p>Drag and drop some files here, or click to select files</p>
//         <em>(2 files are the maximum number of files you can drop here)</em>
//       </div>
//       <aside style={thumbsContainer}>
//         {thumbs}
//       </aside>
//     </section>
//   );
// }

const EditItemPage = () => {
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    console.log('dropped');
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
      <Dropzone />
    </div>
  );
};

EditItemPage.authenticate = true;
EditItemPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditItemPage;
