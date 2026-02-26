import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD7DUP7QHiYrTl0N33a8TPR6LbsRsVKE4g",
  authDomain: "journeytomordor-98c3d.firebaseapp.com",
  projectId: "journeytomordor-98c3d",
  storageBucket: "journeytomordor-98c3d.firebasestorage.app",
  messagingSenderId: "304883708353",
  appId: "1:304883708353:web:2ad0b59807c5560c8d7f40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase features
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
