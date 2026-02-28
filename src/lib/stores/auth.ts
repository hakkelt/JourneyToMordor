import { writable } from 'svelte/store';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';
import {
	clearPendingCloudCache,
	getPendingCloudUserId,
	loadData,
	setStorageMode,
	storageMode
} from '../storage';
import { get } from 'svelte/store';

export const user = writable<User | null>(auth.currentUser);
export const authStateReady = writable<boolean>(false);

let previousUid: string | null = null;
let hasReceivedInitialAuthState = false;

// Listen to auth state changes
onAuthStateChanged(auth, (currentUser) => {
	const currentUid = currentUser?.uid ?? null;
	const pendingCloudUserId = getPendingCloudUserId();

	if (pendingCloudUserId && currentUid && pendingCloudUserId !== currentUid) {
		clearPendingCloudCache(true);
	}

	if (hasReceivedInitialAuthState && previousUid && !currentUid) {
		clearPendingCloudCache(true);
	}

	if (hasReceivedInitialAuthState && previousUid && currentUid && previousUid !== currentUid) {
		clearPendingCloudCache(true);
	}

	user.set(currentUser);

	if (currentUser && get(storageMode) === null) {
		setStorageMode('cloud');
		loadData();
	}

	previousUid = currentUid;
	hasReceivedInitialAuthState = true;
	authStateReady.set(true);
});
