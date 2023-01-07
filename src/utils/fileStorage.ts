/* istanbul ignore file -- @preserve */
// TODO test coverage to be implemented (https://github.com/dlgarciabr/papermodels/issues/27)

import { UploadItemFile } from 'src/pageComponents/items/types';
import storageProvider from './storageProviders/firebase';

export const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'artifacts';

export const listAllFiles = async () => await storageProvider.listAllFiles();

export const getFilePath = async (path: string) => await storageProvider.getFilePath(path);

// TODO remove this commented code if new saveFile is working properly
// export const saveFile = async (file: UploadItemFile) =>
//   await storageProvider.saveFile(file, `${ARTIFACTS_PATH}/${file.storageName}`);

export const saveFile = async (file: File) => await storageProvider.saveFile(file, `${ARTIFACTS_PATH}/${file.name}`);

export const deleteFile = async (path: string) => await storageProvider.deleteFile(path);
