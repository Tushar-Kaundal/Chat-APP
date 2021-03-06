/* eslint-disable no-unused-vars */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCH4Vc4ybBQdFK8XGV25Qu9CmA5S284glI',
  authDomain: 'chat-web-app-acdc9.firebaseapp.com',
  databaseURL:
    'https://chat-web-app-acdc9-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'chat-web-app-acdc9',
  storageBucket: 'chat-web-app-acdc9.appspot.com',
  messagingSenderId: '293156563229',
  appId: '1:293156563229:web:7c056f2375443e542f99f4',
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
