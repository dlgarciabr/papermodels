import { RouterContext } from '@blitzjs/next';
import { invoke } from '@blitzjs/rpc';
import { FileType, Item, ItemFile } from 'db';
import { useContext } from 'react';
import getItems from 'src/items/queries/getItems';
import { getFilePath } from 'src/utils/fileStorage';

const useSearch = (callback: (items: Item[]) => void) => {
  const router = useContext(RouterContext);
  return async (expression: string, page: number) => {
    const { items } = await invoke(getItems, {
      where: {
        name: { contains: expression }
      },
      include: {
        files: {
          where: {
            artifactType: { equals: FileType.thumbnail }
          }
        }
      },
      orderBy: { name: 'asc' },
      skip: 9 * page,
      take: 9
    });
    void router.push({ query: { expression, page } });
    //TODO  Improve the performance of the code below
    await Promise.all(
      items.map(async (item: Item & { files: ItemFile[] }) => {
        await Promise.all(
          item.files.map(async (file) => {
            file.storagePath = await getFilePath(file.storagePath);
          })
        );
      })
    );
    callback(items);
  };
};

export { useSearch };
