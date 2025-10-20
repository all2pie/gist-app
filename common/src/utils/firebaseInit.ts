import { initializeApp, FirebaseApp, getApps } from 'firebase/app';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const getFirebaseConfig = (): FirebaseConfig => {
  const configString = import.meta.env.VITE_FIREBASE_CONFIG;

  if (!configString) {
    throw new Error('VITE_FIREBASE_CONFIG environment variable is not set');
  }

  try {
    const config = JSON.parse(configString);
    return config as FirebaseConfig;
  } catch (error) {
    console.error('Failed to parse Firebase config:', error);
    throw new Error('Invalid Firebase configuration format');
  }
};

export const initFirebase = (): FirebaseApp => {
  const config = getFirebaseConfig();

  // Check if Firebase is already initialized
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  return initializeApp(config);
};
