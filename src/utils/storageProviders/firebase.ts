/* istanbul ignore file -- @preserve */
// TODO test coverage to be implemented (https://github.com/dlgarciabr/papermodels/issues/27)
import { FirebaseApp, FirebaseOptions, initializeApp, getApps } from 'firebase/app';
import {
  getStorage as getFirebaseStorage,
  listAll,
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject
} from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { ARTIFACTS_PATH } from '../fileStorage';

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
    initializeApp(firebaseConfig);
  }

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (RECAPTCHA_SITE_KEY) {
    initializeAppCheck(getApps()[0], {
      provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
  } else {
    throw 'FirebaseApp not initialized\nEnvironment variable NEXT_RECAPTCHA_SITE_KEY not set';
  }
  return getApps()[0] as FirebaseApp;
};

const getStorage = () => getFirebaseStorage(getFirebaseApp());

const listAllFiles = async () => await listAll(ref(getStorage(), ARTIFACTS_PATH));

const getFilePath = async (path: string) => await getDownloadURL(ref(getStorage(), `${ARTIFACTS_PATH}/${path}`));

const saveFile = (file: File, path: string) => {
  const fileRef = ref(getStorage(), path);
  return uploadBytes(fileRef, file);
  // const uploadTask = storageRef.put(firstFile);
  // uploadTask.on(‘state_changed’, function progress(snapshot) {
  //    console.log(snapshot.totalBytesTransferred); // progress of upload
  // });
};

const deleteFile = async (path: string) => {
  const fileRef = ref(getStorage(), `${ARTIFACTS_PATH}/${path}`);
  return deleteObject(fileRef)
    .then(() => {
      // File deleted successfully
    })
    .catch((error) => {
      throw error;
      // Uh-oh, an error occurred!
    });
};

const firebase = {
  getFilePath,
  listAllFiles,
  saveFile,
  deleteFile
};

export default firebase;
