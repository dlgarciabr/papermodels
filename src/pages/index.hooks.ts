import { RouterContext } from '@blitzjs/next';
import { invoke } from '@blitzjs/rpc';
import { Item, ItemFile } from 'db';
import { useContext } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import getItemsAnonymous from 'src/items/queries/getItemsAnonymous';
import { getFileUrl } from 'src/utils/fileStorage';

const useSearch = () => {
  const router = useContext(RouterContext);
  const { executeRecaptcha } = useGoogleReCaptcha();
  return (expression: string, page: number): Promise<{ items: Item[]; count: number }> =>
    new Promise(async (resolve, reject) => {
      if (!executeRecaptcha) {
        reject('Execute recaptcha not yet available');
        return;
      }
      const gRecaptchaToken = await executeRecaptcha('searchItems');
      const { items, count } = await invoke(getItemsAnonymous, {
        gRecaptchaToken,
        where: {
          name: { contains: expression }
        },
        orderBy: { name: 'asc' },
        skip: 9 * page,
        take: 9
      });
      void router.push({ query: { expression, page } });
      await Promise.all(
        items.map(async (item: Item & { files: ItemFile[] }) => {
          await Promise.all(
            item.files.map(async (file) => {
              file.storagePath = getFileUrl(file.storagePath);
            })
          );
        })
      );
      resolve({ items, count });
    });
};

export { useSearch };
