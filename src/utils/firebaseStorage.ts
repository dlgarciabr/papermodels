/* istanbul ignore file -- @preserve */
// TODO test coverage to be implemented (https://github.com/dlgarciabr/papermodels/issues/27)
import { FirebaseApp, FirebaseOptions, initializeApp, getApps } from 'firebase/app';
import { getStorage as getFirebaseStorage, listAll, ref, getDownloadURL } from 'firebase/storage';

const FILES_PATH = 'artifacts';

const getFirebaseApp = (): FirebaseApp => {
  const firebaseConfig: FirebaseOptions = {
    apiKey: 'AIzaSyDfH-Wfq2vzCT8ULhzWYbtv-6E3v3_Vw-s',
    authDomain: 'papermodels-5a9e1.firebaseapp.com',
    projectId: 'papermodels-5a9e1',
    storageBucket: 'papermodels-5a9e1.appspot.com',
    messagingSenderId: '427465803853',
    appId: '1:427465803853:web:fa782e8eb6f474f14df404',
    measurementId: 'G-B8W9NCLDY8'
  };
  if (!getApps().length) {
    // Initialize Firebase
    initializeApp(firebaseConfig);
  }
  return getApps()[0] as FirebaseApp;
};

export const getStorage = () => getFirebaseStorage(getFirebaseApp());

export const listAllFiles = async () => {
  const result = await listAll(ref(getStorage(), FILES_PATH));
  return result;
};

export const getFilePath = async (fileId) => {
  const url = await getDownloadURL(ref(getStorage(), `${FILES_PATH}/${fileId}`));
  return url;
};

export const saveImage = () => {
  throw 'Not implemented';
};

export const deleteImage = () => {
  throw 'Not implemented';
};
