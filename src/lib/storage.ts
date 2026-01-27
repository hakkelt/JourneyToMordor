export interface LogEntry {
	id: number;
	date: string; // YYYY-MM-DD
	distance: number; // in km
	note?: string;
}

export interface LocalStorageSchema {
	logs: LogEntry[];
	unit: 'km' | 'miles';
}

import { get, writable } from 'svelte/store';
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { type User, deleteUser } from 'firebase/auth';
import { isOnline, hasPendingSync } from './stores/network';

export const STORAGE_KEY = 'mordor_tracker_v1';

export const DEFAULT_STATE: LocalStorageSchema = {
	logs: [],
	unit: 'km'
};

export const journeyStore = writable<LocalStorageSchema>(DEFAULT_STATE);

// Helper to ensure we're in the browser
const isBrowser = () => typeof localStorage !== 'undefined';

// Helper to calculate start date from logs
export function getStartDate(logs: LogEntry[]): string {
	if (logs.length === 0) {
		return new Date().toISOString().split('T')[0];
	}
	// Find the earliest log entry
	const sortedDates = logs.map((log) => log.date).sort();
	return sortedDates[0];
}

export function loadData(): LocalStorageSchema {
	if (!isBrowser()) return DEFAULT_STATE;

	const raw = localStorage.getItem(STORAGE_KEY);
	let data = DEFAULT_STATE;
	if (raw) {
		try {
			const parsed = JSON.parse(raw);
			data = { ...DEFAULT_STATE, ...parsed };
		} catch (e) {
			console.error('Failed to parse journey data', e);
		}
	}
	journeyStore.set(data);
	return data;
}

export async function syncWithFirestore(user: User): Promise<void> {
	if (!user) return;

	// Check if we're online before attempting sync
	if (!get(isOnline)) {
		console.log('Offline: sync will be attempted when connection is restored');
		hasPendingSync.set(true);
		return;
	}

	const userDocRef = doc(db, 'users', user.uid);
	const localData = get(journeyStore);

	try {
		const docSnap = await getDoc(userDocRef);

		if (docSnap.exists()) {
			const remoteData = docSnap.data() as LocalStorageSchema;
			const merged = mergeData(localData, remoteData);

			// Update local
			journeyStore.set(merged);
			saveData(merged); // Saves to localStorage

			// Update remote if different
			if (JSON.stringify(merged) !== JSON.stringify(remoteData)) {
				await setDoc(userDocRef, merged);
			}
		} else {
			// No remote data, upload local
			await setDoc(userDocRef, localData);
		}

		// Clear pending sync flag on successful sync
		hasPendingSync.set(false);
	} catch (e) {
		console.error('Sync failed:', e);
		// Mark as pending sync if it failed
		hasPendingSync.set(true);
	}
}

function mergeData(local: LocalStorageSchema, remote: LocalStorageSchema): LocalStorageSchema {
	// 1. Identify all unique logs by ID (timestamp)
	const allLogs = [...local.logs, ...remote.logs];
	const uniqueLogsMap = new Map<number, LogEntry>();

	allLogs.forEach((log) => {
		// If we already have this ID, we assume the content is the same
		// (or we prioritize one? Remote? Local? Since ID is timestamp, same ID should be same entry)
		if (!uniqueLogsMap.has(log.id)) {
			uniqueLogsMap.set(log.id, log);
		}
	});

	const unifiedLogs = Array.from(uniqueLogsMap.values()).sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id
	);

	const mergedData: LocalStorageSchema = {
		logs: unifiedLogs,
		unit: local.unit // Prefer local unit setting or remote? Let's stick to local user pref for now
	};

	// Warning logic could be triggered here via a store or event,
	// but for now we just return the merged result.
	// Ideally we export a "syncStatus" store to show messages.

	return mergedData;
}

async function syncOrQueue(user: User | null | undefined, data: LocalStorageSchema) {
	if (user) {
		if (get(isOnline)) {
			const userDocRef = doc(db, 'users', user.uid);
			setDoc(userDocRef, data).catch((e) => console.error('Failed to save to firestore', e));
		} else {
			hasPendingSync.set(true);
		}
	}
}

export function saveData(data: LocalStorageSchema): void {
	if (!isBrowser()) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addLog(entry: Omit<LogEntry, 'id'>, currentUser?: User | null): LocalStorageSchema {
	const current = get(journeyStore); // Use store state instead of reloading from disk
	const newEntry: LogEntry = {
		...entry,
		id: Date.now()
	};

	const updated: LocalStorageSchema = {
		...current,
		logs: [newEntry, ...current.logs]
	};

	saveData(updated);
	journeyStore.set(updated);

	syncOrQueue(currentUser, updated);

	return updated;
}

export function deleteLog(id: number, currentUser?: User | null): LocalStorageSchema {
	const current = get(journeyStore);
	const updated: LocalStorageSchema = {
		...current,
		logs: current.logs.filter((log) => log.id !== id)
	};
	saveData(updated);
	journeyStore.set(updated);

	syncOrQueue(currentUser, updated);

	return updated;
}

export function deleteAllLogs(currentUser?: User | null): LocalStorageSchema {
	const current = get(journeyStore);
	const updated: LocalStorageSchema = {
		...current,
		logs: []
	};
	saveData(updated);
	journeyStore.set(updated);

	syncOrQueue(currentUser, updated);
	return updated;
}

export function importLogs(newLogs: LogEntry[], currentUser?: User | null): LocalStorageSchema {
	const current = get(journeyStore);
	const updated: LocalStorageSchema = {
		...current,
		logs: newLogs
	};
	saveData(updated);
	journeyStore.set(updated);

	syncOrQueue(currentUser, updated);
	return updated;
}

export function setUnit(unit: 'km' | 'miles', currentUser?: User | null): LocalStorageSchema {
	const current = get(journeyStore);
	const updated: LocalStorageSchema = {
		...current,
		unit
	};
	saveData(updated);
	journeyStore.set(updated);

	syncOrQueue(currentUser, updated);
	return updated;
}

export function resetData(): LocalStorageSchema {
	if (isBrowser()) {
		localStorage.removeItem(STORAGE_KEY);
	}
	journeyStore.set(DEFAULT_STATE);
	return DEFAULT_STATE;
}

export async function deleteUserAccount(user: User): Promise<void> {
	try {
		const userDocRef = doc(db, 'users', user.uid);
		await deleteDoc(userDocRef);
		await deleteUser(user);
		resetData();
	} catch (e) {
		console.error('Failed to delete user account', e);
		throw e;
	}
}
