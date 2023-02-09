/* istanbul ignore file -- @preserve */
// TODO test coverage to be implemented (https://github.com/dlgarciabr/papermodels/issues/27)

import { UploadItemFile } from 'src/items/types';
import storageProvider from './storageProviders/firebase';

export const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'artifacts';

export const listAllFiles = async () => await storageProvider.listAllFiles();

/**
 * Retrieves a full downloadable artifact url from a pre-defined storage provider
 *
 * @param path initial stored artifact path
 * @returns full storage artifact url
 */
export const getFilePath = (path: string) => storageProvider.getFilePath(path);

export const saveFile = (file: UploadItemFile) =>
  storageProvider.saveFile(file.bytes!, `${ARTIFACTS_PATH}/${file.storagePath}`);

export const deleteFile = async (path: string) => await storageProvider.deleteFile(path);
