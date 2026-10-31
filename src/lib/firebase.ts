import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAODoIB_zF17MqJz_Bzxc1BBZjA_KVvLeE',
  authDomain: 'steward-little.firebaseapp.com',
  databaseURL:
    'https://steward-little-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'steward-little',
  storageBucket: 'steward-little.firebasestorage.app',
  messagingSenderId: '729461128944',
  appId: '1:729461128944:web:8ee1358db9405115064c35',
  measurementId: 'G-6NMKPB051J',
};

export const app = initializeApp(firebaseConfig);

// Cloud Firestore — collections: `users/{mobile}` and `orders/{orderId}`
export const db = getFirestore(app);

export const USERS_COLLECTION = 'users';
export const ORDERS_COLLECTION = 'orders';
