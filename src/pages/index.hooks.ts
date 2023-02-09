import { RouterContext } from '@blitzjs/next';
import { invoke } from '@blitzjs/rpc';
import { Item, ItemFile } from 'db';
import { useContext } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import getItemsAnonymous from 'src/items/queries/getItemsAnonymous';
import { Cloudinary } from '@cloudinary/url-gen';

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
      const cld = new Cloudinary({
        cloud: {
          cloudName: process.env.NEXT_CLOUDINARY_CLOUD_NAME
        }
      });
      void router.push({ query: { expression, page } });
      await Promise.all(
        items.map(async (item: Item & { files: ItemFile[] }) => {
          await Promise.all(
            item.files.map(async (file) => {
              file.storagePath = cld.image(file.storagePath.split('.')[0]).toURL();
            })
          );
        })
      );
      resolve({ items, count });
    });
};

export { useSearch };
