// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp, getApps } from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC_di3Il95_FU7PjFSfn6OVVpLKFgz7X1U',
  authDomain: 'git-notes-7f1c1.firebaseapp.com',
  projectId: 'git-notes-7f1c1',
  storageBucket: 'git-notes-7f1c1.firebasestorage.app',
  messagingSenderId: '460246786515',
  appId: '1:460246786515:web:ecfec4c208dad61c610f26',
};

// Initialize Firebase (only once)
export const initFirebase = (): FirebaseApp => {
  // Check if Firebase is already initialized
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  return initializeApp(firebaseConfig);
};
