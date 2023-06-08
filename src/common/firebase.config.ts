import { ServiceAccount } from 'firebase-admin';

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
export const adminConfig: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

export const firebaseConfigTest = {
  apiKey: process.env.TEST_FIREBASE_API_KEY,
  authDomain: process.env.TEST_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.TEST_FIREBASE_DATABASE_URL,
  projectId: process.env.TEST_FIREBASE_PROJECT_ID,
  storageBucket: process.env.TEST_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.TEST_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.TEST_FIREBASE_APP_ID,
};
export const adminConfigTest: ServiceAccount = {
  projectId: process.env.TEST_FIREBASE_PROJECT_ID,
  privateKey: process.env.TEST_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  clientEmail: process.env.TEST_FIREBASE_CLIENT_EMAIL,
};
