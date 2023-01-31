import { getAntiCSRFToken } from '@blitzjs/auth';
import { RouterContext } from '@blitzjs/next';
import { Item, ItemFile } from 'db';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useContext } from 'react';
import { getFilePath } from 'src/utils/fileStorage';

// const useSearch = () => {
//   const router = useContext(RouterContext);
//   return (expression: string, page: number): Promise<{ items: Item[]; count: number }> =>
//     new Promise(async (resolve) => {
//       const { items, count } = await invoke(getItemsAnonymous, {
//         where: {
//           name: { contains: expression }
//         },
//         orderBy: { name: 'asc' },
//         skip: 9 * page,
//         take: 9
//       });
//       void router.push({ query: { expression, page } });
//       await Promise.all(
//         items.map(async (item: Item & { files: ItemFile[] }) => {
//           await Promise.all(
//             item.files.map(async (file) => {
//               file.storagePath = await getFilePath(file.storagePath);
//             })
//           );
//         })
//       );
//       resolve({ items, count });
//     });
// };

const useSearch = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useContext(RouterContext);
  return async (expression: string, page: number): Promise<{ items: Item[]; count: number }> => {
    if (!executeRecaptcha) {
      console.error('Execute recaptcha not yet available');
      return Promise.reject();
    }
    const gRecaptchaToken = await executeRecaptcha('searchForm');
    const antiCSRFToken = getAntiCSRFToken();

    const response = await fetch(`${location.origin}/api/store`, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'anti-csrf': antiCSRFToken
      },
      body: JSON.stringify({
        expression,
        page,
        gRecaptchaToken
      })
    });

    const jsonResponse = await response.json();

    if (jsonResponse?.status === 'success') {
      void router.push({ query: { expression, page } });
      const items: Item[] = [...jsonResponse?.data.items];
      await Promise.all(
        items.map(async (item: Item & { files: ItemFile[] }) => {
          await Promise.all(
            item.files.map(async (file) => {
              file.storagePath = await getFilePath(file.storagePath);
            })
          );
        })
      );
      return Promise.resolve({ items, count: jsonResponse?.data.count });
    } else {
      console.log(jsonResponse?.message);
      return Promise.reject();
    }
  };
};

export { useSearch };
