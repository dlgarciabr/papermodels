/* istanbul ignore file -- @preserve */
// TODO test coverage to be implemented (https://github.com/dlgarciabr/papermodels/issues/27)

import storageProvider from './storageProviders/firebase';

export const listAllFiles = async () => {
  return await storageProvider.listAllFiles();
};

export const getFilePath = async (fileId) => {
  return await storageProvider.getFilePath(fileId);
};

export const saveImage = async () => {
  return await storageProvider.saveImage();
};

export const deleteImage = async () => {
  return await storageProvider.deleteImage();
};
