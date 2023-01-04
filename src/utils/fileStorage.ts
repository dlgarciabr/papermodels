/* istanbul ignore file -- @preserve */
// TODO test coverage to be implemented (https://github.com/dlgarciabr/papermodels/issues/27)

import { PersistableFile } from 'types';
import storageProvider from './storageProviders/firebase';

export const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'artifacts';

export const listAllFiles = async () => await storageProvider.listAllFiles();

export const getFilePath = async (fileId: string) => await storageProvider.getFilePath(fileId);

export const saveFile = async (file: PersistableFile) =>
  await storageProvider.saveFile(file, `${ARTIFACTS_PATH}/${file.storageName}`);

export const deleteFile = async () => await storageProvider.deleteFile();
