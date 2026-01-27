import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Store to track online/offline status
 */
export const isOnline = writable(browser ? navigator.onLine : true);

/**
 * Store to track pending sync operations
 */
export const hasPendingSync = writable(false);

if (browser) {
	// Update online status when network status changes
	window.addEventListener('online', () => {
		isOnline.set(true);
	});

	window.addEventListener('offline', () => {
		isOnline.set(false);
	});
}
