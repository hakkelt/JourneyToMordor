import { writable } from 'svelte/store';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';

export const user = writable<User | null>(null);

// Listen to auth state changes
onAuthStateChanged(auth, (currentUser) => {
	user.set(currentUser);
});
