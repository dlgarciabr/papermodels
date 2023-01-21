import { RouterContext } from '@blitzjs/next';
import { invoke } from '@blitzjs/rpc';
import { useContext } from 'react';
import getItems from 'src/items/queries/getItems';

const useHandleSearch = (callback: Function) => {
  const router = useContext(RouterContext);
  return async (expression: string, page: number) => {
    const { items } = await invoke(getItems, {
      where: { name: { contains: expression } },
      orderBy: { name: 'asc' },
      skip: 9 * page,
      take: 9
    });
    void router.push({ query: { expression, page } });
    callback(items);
  };
};

export { useHandleSearch };
