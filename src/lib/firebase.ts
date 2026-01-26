import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyAmuiHjC7v9rsg0FOjqRey8P8p8DQ9UoZg',
	authDomain: 'future-surge-132518.firebaseapp.com',
	projectId: 'future-surge-132518',
	storageBucket: 'future-surge-132518.firebasestorage.app',
	messagingSenderId: '131159841345',
	appId: '1:131159841345:web:91e88d2ac7d6b89b3d44c0'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase features
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');
export const appleProvider = new OAuthProvider('apple.com');
export const db = getFirestore(app);
