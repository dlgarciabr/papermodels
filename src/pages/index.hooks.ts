import { RouterContext } from '@blitzjs/next';
import { invoke } from '@blitzjs/rpc';
import { Item, ItemFile } from 'db';
import { useContext } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import countItemsAnonymous from 'src/items/queries/countItemsAnonymous';
import getItemsAnonymous from 'src/items/queries/getItemsAnonymous';
import { getFileUrl } from 'src/utils/fileStorage';

const searchByWhere = (page: number, pageSize: number, gRecaptchaToken: string, where?: any) => {
  return invoke(getItemsAnonymous, {
    gRecaptchaToken,
    where,
    orderBy: { name: 'asc' },
    skip: pageSize * page,
    take: pageSize
  });
};

const randomPick = (values: string[]) => {
  const index = Math.floor(Math.random() * values.length);
  return values[index];
};

const doRandomSearch = async (count: number, gRecaptchaToken: string) => {
  const itemCount = await invoke(countItemsAnonymous, {
    gRecaptchaToken,
    where: {}
  });
  const skip = Math.max(0, Math.floor(Math.random() * itemCount) - count);
  const orderBy = randomPick(['id', 'name', 'description', 'author']) as string;
  const orderDir = randomPick(['asc', 'desc']);

  return invoke(getItemsAnonymous, {
    gRecaptchaToken,
    take: count,
    skip: skip,
    orderBy: { [orderBy]: orderDir }
  });
};

const fulFillItemsFilesUrls = (items: (Item & { files: ItemFile[] })[]) => {
  return Promise.all(
    items.map(async (item: Item & { files: ItemFile[] }) => {
      await Promise.all(
        item.files.map(async (file) => {
          file.storagePath = getFileUrl(file.storagePath);
        })
      );
    })
  );
};

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
      const { items, count } = await searchByWhere(page, 9, gRecaptchaToken, { name: { contains: expression } });
      void router.push({ query: { expression, page } });
      await fulFillItemsFilesUrls(items);
      resolve({ items, count });
    });
};

const useGetSugestions = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  return (): Promise<{ items: Item[]; count: number }> =>
    new Promise(async (resolve, reject) => {
      if (!executeRecaptcha) {
        reject('Execute recaptcha not yet available');
        return;
      }
      const gRecaptchaToken = await executeRecaptcha('searchItems');
      const { items, count } = await doRandomSearch(3, gRecaptchaToken);
      await fulFillItemsFilesUrls(items);
      resolve({ items, count });
    });
};

const useGetItemsByCategory = () => {
  const router = useContext(RouterContext);
  const { executeRecaptcha } = useGoogleReCaptcha();
  return (categoryId: number, page: number): Promise<{ items: Item[]; count: number }> =>
    new Promise(async (resolve, reject) => {
      if (!executeRecaptcha) {
        reject('Execute recaptcha not yet available');
        return;
      }
      const gRecaptchaToken = await executeRecaptcha('searchItems');
      const { items, count } = await searchByWhere(page, 9, gRecaptchaToken, { categoryId });
      console.log('count', count);
      void router.push({ query: { categoryId, page } });
      await fulFillItemsFilesUrls(items);
      resolve({ items, count });
    });
};

export { useSearch, useGetSugestions, useGetItemsByCategory };
