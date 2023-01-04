/* istanbul ignore file -- @preserve */
// TODO test coverage to be implemented (https://github.com/dlgarciabr/papermodels/issues/27)

import storageProvider from './storageProviders/firebase';

export const listAllFiles = async () => await storageProvider.listAllFiles();

export const getFilePath = async (fileId: string) => await storageProvider.getFilePath(fileId);

export const saveFile = async (file: File) => await storageProvider.saveFile(file);

export const deleteFile = async () => await storageProvider.deleteFile();
