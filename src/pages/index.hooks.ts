import { RouterContext, Routes } from '@blitzjs/next';
import { invoke } from '@blitzjs/rpc';
import { Item, ItemFile } from 'db';
import { useContext } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import getItemsAnonymous from 'src/items/queries/getItemsAnonymous';
import { getFilePath } from 'src/utils/fileStorage';

const useSearch = () => {
  const router = useContext(RouterContext);
  const { executeRecaptcha } = useGoogleReCaptcha();
  return (expression: string, page: number): Promise<{ items: Item[]; count: number }> =>
    new Promise(async (resolve) => {
      if (!executeRecaptcha) {
        console.error('Execute recaptcha not yet available');
        return Promise.reject();
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
              file.storagePath = await getFilePath(file.storagePath);
            })
          );
        })
      );
      resolve({ items, count });
    });
};

const useShowItem = () => {
  const router = useContext(RouterContext);
  const { executeRecaptcha } = useGoogleReCaptcha();
  return (itemId: number): void => {
    // new Promise(async (resolve) => {
    if (!executeRecaptcha) {
      console.error('Execute recaptcha not yet available');
      // return Promise.reject();
    }
    // const gRecaptchaToken = await executeRecaptcha('searchForm');
    // const { items, count } = await invoke(getItemsAnonymous, {
    //   gRecaptchaToken,
    //   where: {
    //     name: { contains: expression }
    //   },
    //   orderBy: { name: 'asc' },
    //   skip: 9 * page,
    //   take: 9
    // });
    void router.push(Routes.ShowItemPage({ itemId }));

    // resolve({ items, count });
  };
};

export { useSearch, useShowItem };
