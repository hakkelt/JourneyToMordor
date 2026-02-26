export interface LogEntry {
	id: number;
	date: string; // YYYY-MM-DD
	distance: number; // in km
	note?: string;
}

export interface LocalStorageSchema {
	logs: LogEntry[];
	unit: 'km' | 'miles';
	deletedLogIds: number[];
}

export type StorageMode = 'local' | 'cloud';

import { get, writable } from 'svelte/store';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { type User, deleteUser } from 'firebase/auth';
import { isOnline, hasPendingSync } from './stores/network';

export const STORAGE_KEY = 'mordor_tracker_v1';
export const STORAGE_MODE_KEY = 'mordor_storage_mode_v1';
export const CLOUD_PENDING_USER_KEY = 'mordor_pending_cloud_user_v1';

export const DEFAULT_STATE: LocalStorageSchema = {
	logs: [],
	unit: 'km',
	deletedLogIds: []
};

export const journeyStore = writable<LocalStorageSchema>(DEFAULT_STATE);
export const storageMode = writable<StorageMode | null>(null);

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

	const mode = get(storageMode);
	const raw = localStorage.getItem(STORAGE_KEY);
	let data = DEFAULT_STATE;
	if (raw) {
		try {
			const parsed = JSON.parse(raw);
			data = normalizeData(parsed);
		} catch (e) {
			console.error('Failed to parse journey data', e);
		}
	}

	if (mode === 'cloud' && !getPendingCloudUserId()) {
		journeyStore.set(DEFAULT_STATE);
		return DEFAULT_STATE;
	}

	journeyStore.set(data);
	return data;
}

function normalizeData(input: unknown): LocalStorageSchema {
	const parsed =
		typeof input === 'object' && input !== null ? (input as Partial<LocalStorageSchema>) : {};
	return {
		logs: Array.isArray(parsed.logs) ? parsed.logs : [],
		unit: parsed.unit === 'miles' ? 'miles' : 'km',
		deletedLogIds: Array.isArray(parsed.deletedLogIds) ? parsed.deletedLogIds : []
	};
}

export function loadStorageMode(): StorageMode | null {
	if (!isBrowser()) return null;

	const raw = localStorage.getItem(STORAGE_MODE_KEY);
	if (raw === 'local' || raw === 'cloud') {
		if (raw === 'local') {
			clearPendingCloudCache(false);
		}
		storageMode.set(raw);
		return raw;
	}

	const pendingCloudUserId = getPendingCloudUserId();
	if (pendingCloudUserId) {
		storageMode.set('cloud');
		return 'cloud';
	}

	if (localStorage.getItem(STORAGE_KEY)) {
		storageMode.set('local');
		localStorage.setItem(STORAGE_MODE_KEY, 'local');
		return 'local';
	}

	if (auth.currentUser) {
		storageMode.set('cloud');
		return 'cloud';
	}

	storageMode.set(null);
	return null;
}

export function setStorageMode(mode: StorageMode): void {
	storageMode.set(mode);
	if (!isBrowser()) return;

	if (mode === 'cloud') {
		localStorage.removeItem(STORAGE_MODE_KEY);
		return;
	}

	clearPendingCloudCache(false);

	localStorage.setItem(STORAGE_MODE_KEY, mode);
}

export function resetStorageMode(): void {
	storageMode.set(null);
	if (!isBrowser()) return;
	localStorage.removeItem(STORAGE_MODE_KEY);
}

export async function changeStorageMode(
	mode: StorageMode,
	currentUser?: User | null
): Promise<void> {
	const currentData = get(journeyStore);
	setStorageMode(mode);

	if (mode !== 'cloud') {
		saveData(currentData);
	}

	if (currentUser && mode === 'cloud' && get(isOnline)) {
		await syncWithFirestore(currentUser);
	}
}

export async function syncWithFirestore(user: User): Promise<void> {
	if (!user) return;
	const mode = get(storageMode);
	if (!mode || mode === 'local') return;

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
			const remoteData = normalizeData(docSnap.data());
			const merged = mergeData(localData, remoteData);

			// Update local
			journeyStore.set(merged);
			saveData(merged);

			// Update remote if different
			if (JSON.stringify(merged) !== JSON.stringify(remoteData)) {
				await setDoc(userDocRef, merged);
			}
		} else {
			// No remote data, upload local
			await setDoc(userDocRef, normalizeData(localData));
		}

		// Clear pending sync flag on successful sync
		hasPendingSync.set(false);
		clearPendingCloudCache(false);
	} catch (e) {
		console.error('Sync failed:', e);
		// Mark as pending sync if it failed
		hasPendingSync.set(true);
	}
}

function mergeData(local: LocalStorageSchema, remote: LocalStorageSchema): LocalStorageSchema {
	const deletedSet = new Set<number>([...local.deletedLogIds, ...remote.deletedLogIds]);
	const uniqueLogsMap = new Map<number, LogEntry>();

	for (const log of local.logs) {
		if (!deletedSet.has(log.id)) {
			uniqueLogsMap.set(log.id, log);
		}
	}

	for (const log of remote.logs) {
		if (!deletedSet.has(log.id) && !uniqueLogsMap.has(log.id)) {
			uniqueLogsMap.set(log.id, log);
		}
	}

	const unifiedLogs = Array.from(uniqueLogsMap.values()).sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id
	);

	const mergedData: LocalStorageSchema = {
		logs: unifiedLogs,
		unit: local.unit,
		deletedLogIds: Array.from(deletedSet).sort((a, b) => b - a)
	};

	return mergedData;
}

async function syncOrQueue(user: User | null | undefined, data: LocalStorageSchema) {
	const mode = get(storageMode);
	if (!mode || mode === 'local') return;

	if (user) {
		if (get(isOnline)) {
			const userDocRef = doc(db, 'users', user.uid);
			setDoc(userDocRef, data).catch((e) => console.error('Failed to save to firestore', e));
			clearPendingCloudCache(false);
		} else {
			cachePendingCloudData(data, user.uid);
			hasPendingSync.set(true);
		}
	}
}

export function saveData(data: LocalStorageSchema, currentUser?: User | null): void {
	if (!isBrowser()) return;

	if (get(storageMode) === 'cloud') {
		if (!get(isOnline) && currentUser) {
			cachePendingCloudData(data, currentUser.uid);
		}
		return;
	}

	clearPendingCloudCache(false);
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
		logs: [newEntry, ...current.logs],
		deletedLogIds: current.deletedLogIds.filter((deletedId) => deletedId !== newEntry.id)
	};

	saveData(updated, currentUser);
	journeyStore.set(updated);

	syncOrQueue(currentUser, updated);

	return updated;
}

export function deleteLog(id: number, currentUser?: User | null): LocalStorageSchema {
	const current = get(journeyStore);
	const updated: LocalStorageSchema = {
		...current,
		logs: current.logs.filter((log) => log.id !== id),
		deletedLogIds: Array.from(new Set([...current.deletedLogIds, id]))
	};
	saveData(updated, currentUser);
	journeyStore.set(updated);

	syncOrQueue(currentUser, updated);

	return updated;
}

export function deleteAllLogs(currentUser?: User | null): LocalStorageSchema {
	const current = get(journeyStore);
	const updated: LocalStorageSchema = {
		...current,
		logs: [],
		deletedLogIds: Array.from(
			new Set([...current.deletedLogIds, ...current.logs.map((log) => log.id)])
		)
	};
	saveData(updated, currentUser);
	journeyStore.set(updated);

	syncOrQueue(currentUser, updated);
	return updated;
}

export function importLogs(newLogs: LogEntry[], currentUser?: User | null): LocalStorageSchema {
	const current = get(journeyStore);
	const newLogIdSet = new Set(newLogs.map((log) => log.id));
	const removedIds = current.logs.filter((log) => !newLogIdSet.has(log.id)).map((log) => log.id);
	const updated: LocalStorageSchema = {
		...current,
		logs: newLogs,
		deletedLogIds: Array.from(new Set([...current.deletedLogIds, ...removedIds]))
	};
	saveData(updated, currentUser);
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
	saveData(updated, currentUser);
	journeyStore.set(updated);

	syncOrQueue(currentUser, updated);
	return updated;
}

export function resetData(): LocalStorageSchema {
	if (isBrowser()) {
		localStorage.removeItem(STORAGE_KEY);
	}
	clearPendingCloudCache(false);
	journeyStore.set(DEFAULT_STATE);
	return DEFAULT_STATE;
}

function cachePendingCloudData(data: LocalStorageSchema, userId: string): void {
	if (!isBrowser()) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	localStorage.setItem(CLOUD_PENDING_USER_KEY, userId);
}

export function getPendingCloudUserId(): string | null {
	if (!isBrowser()) return null;
	return localStorage.getItem(CLOUD_PENDING_USER_KEY);
}

export function hasPendingCloudData(): boolean {
	if (!isBrowser()) return false;
	return Boolean(localStorage.getItem(STORAGE_KEY) && localStorage.getItem(CLOUD_PENDING_USER_KEY));
}

export function clearPendingCloudCache(resetStore: boolean = false): void {
	if (isBrowser()) {
		const hadPendingCloudCache = Boolean(localStorage.getItem(CLOUD_PENDING_USER_KEY));
		localStorage.removeItem(CLOUD_PENDING_USER_KEY);
		if (hadPendingCloudCache) {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	if (resetStore) {
		journeyStore.set(DEFAULT_STATE);
	}
}

export function discardPendingCloudChangesAndResetMode(): void {
	if (isBrowser()) {
		localStorage.removeItem(STORAGE_KEY);
	}
	clearPendingCloudCache(true);
	resetStorageMode();
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
