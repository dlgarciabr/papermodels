/* istanbul ignore file -- @preserve */
// TODO test coverage to be implemented (https://github.com/dlgarciabr/papermodels/issues/27)

import { UploadItemFile } from 'src/items/types';
import storageProvider from './storageProviders/cloudinary';

export const ARTIFACTS_PATH = process.env.NEXT_PUBLIC_STORAGE_ARTIFACTS_PATH || 'papermodel';

export const listAllFiles = async () => {
  throw new Error('not implemented');
};

// export const listAllFiles = async () => await storageProvider.listAllFiles();

/**
 * Retrieves a full downloadable artifact url from a pre-defined storage provider
 *
 * @param path initial stored artifact path
 * @returns full storage artifact url
 */
export const getFileUrl = (path: string) => storageProvider.getFileUrl(path);

export const getThumbnailUrl = (path: string) => storageProvider.getThumbnailUrl(path);

export const saveFile = (file: UploadItemFile) => storageProvider.saveFile(file, `${ARTIFACTS_PATH}/${file.item.id}`);

export const deleteFile = async (path: string) => storageProvider.deleteFile(path);

export const getPdfThumbnailUrl = (path: string) => storageProvider.getPdfThumbnailUrl(path);
