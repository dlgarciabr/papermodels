/* istanbul ignore file -- @preserve */
// TODO test coverage to be implemented (https://github.com/dlgarciabr/papermodels/issues/27)
import { FirebaseApp, FirebaseOptions, initializeApp, getApps } from 'firebase/app';
import { getStorage as getFirebaseStorage, listAll, ref, getDownloadURL, uploadBytes } from 'firebase/storage';

console.log('process.env.REACT_APP_STORAGE_ARTIFACTS_PATH', process.env.REACT_APP_STORAGE_ARTIFACTS_PATH);
const ARTIFACTS_PATH = process.env.REACT_APP_STORAGE_ARTIFACTS_PATH || 'artifacts';

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

const getStorage = () => getFirebaseStorage(getFirebaseApp());

const listAllFiles = async () => await listAll(ref(getStorage(), ARTIFACTS_PATH));

const getFilePath = async (fileId: string) => await getDownloadURL(ref(getStorage(), `${ARTIFACTS_PATH}/${fileId}`));

const saveFile = async (file: File) => {
  const fileRef = ref(getStorage(), `${ARTIFACTS_PATH}/schemes/${file.name}`);
  await uploadBytes(fileRef, file);
};

const deleteFile = () => {
  throw 'Not implemented';
};

const firebase = {
  getFilePath,
  listAllFiles,
  saveFile,
  deleteFile
};

export default firebase;
