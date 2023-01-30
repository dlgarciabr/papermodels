import { RouterContext } from '@blitzjs/next';
import { invoke } from '@blitzjs/rpc';
import { Item, ItemFile } from 'db';
import { useContext } from 'react';
import getItemsAnonymous from 'src/items/queries/getItemsAnonymous';
import { getFilePath } from 'src/utils/fileStorage';

const useSearch = () => {
  const router = useContext(RouterContext);
  return (expression: string, page: number): Promise<{ items: Item[]; count: number }> =>
    new Promise(async (resolve) => {
      const { items, count } = await invoke(getItemsAnonymous, {
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

export { useSearch };
