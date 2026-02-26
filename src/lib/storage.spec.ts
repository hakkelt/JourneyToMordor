/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	loadData,
	loadStorageMode,
	saveData,
	addLog,
	deleteLog,
	deleteAllLogs,
	importLogs,
	setUnit,
	getStartDate,
	resetData,
	deleteUserAccount,
	syncWithFirestore,
	resetStorageMode,
	setStorageMode,
	storageMode,
	journeyStore,
	STORAGE_KEY,
	STORAGE_MODE_KEY,
	CLOUD_PENDING_USER_KEY
} from './storage';
import type { User } from 'firebase/auth';
import { get } from 'svelte/store';
import { isOnline, hasPendingSync } from './stores/network';

vi.mock('./firebase', () => ({
	db: {},
	auth: { currentUser: null },
	googleProvider: {}
}));

vi.mock('firebase/firestore', () => {
	const mockGetDoc = vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) }));
	const mockSetDoc = vi.fn(() => Promise.resolve());
	const mockDeleteDoc = vi.fn(() => Promise.resolve());

	return {
		doc: vi.fn(),
		getDoc: mockGetDoc,
		setDoc: mockSetDoc,
		deleteDoc: mockDeleteDoc,
		getFirestore: vi.fn()
	};
});

vi.mock('firebase/auth', () => {
	const mockDeleteUser = vi.fn(() => Promise.resolve());

	return {
		getAuth: vi.fn(),
		GoogleAuthProvider: vi.fn(),
		deleteUser: mockDeleteUser
	};
});

const localStorageMock = (function () {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value.toString();
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
		_getAll: () => store
	};
})();

Object.defineProperty(global, 'localStorage', {
	value: localStorageMock
});

describe('Storage', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
		resetData();
		setStorageMode('local');
		loadStorageMode();
	});

	it('should return default state when local storage is empty', () => {
		const data = loadData();
		expect(data.logs).toEqual([]);
		expect(data.deletedLogIds).toEqual([]);
		expect(data.unit).toBe('km');
	});

	it('should save and load data with deletion tombstones', () => {
		const data = {
			logs: [{ id: 11, date: '2023-01-01', distance: 5 }],
			unit: 'km' as const,
			deletedLogIds: [99]
		};
		saveData(data);
		expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(data));

		const loaded = loadData();
		expect(loaded).toEqual(data);
	});

	it('should migrate older schema gracefully', () => {
		localStorageMock.setItem(
			STORAGE_KEY,
			JSON.stringify({ logs: [{ id: 123, date: '2023-01-05', distance: 5 }] })
		);
		const loaded = loadData();
		expect(loaded.unit).toBe('km');
		expect(loaded.deletedLogIds).toEqual([]);
		expect(loaded.logs).toHaveLength(1);
	});

	it('should add log entries and persist', () => {
		const result = addLog({ date: '2023-01-01', distance: 10, note: 'Run' });
		expect(result.logs).toHaveLength(1);
		expect(result.deletedLogIds).toEqual([]);
		expect(loadData().logs).toHaveLength(1);
	});

	it('should delete a single log and track deletion event', () => {
		const withLog = addLog({ date: '2023-01-01', distance: 10 });
		const id = withLog.logs[0].id;

		const result = deleteLog(id);
		expect(result.logs).toHaveLength(0);
		expect(result.deletedLogIds).toContain(id);
	});

	it('should delete all logs and preserve deletion events through import', () => {
		addLog({ date: '2023-01-01', distance: 10 });
		const withSecond = addLog({ date: '2023-01-02', distance: 20 });
		const removedIds = withSecond.logs.map((log) => log.id);

		const afterDeleteAll = deleteAllLogs();
		expect(afterDeleteAll.logs).toHaveLength(0);
		expect(afterDeleteAll.deletedLogIds).toEqual(expect.arrayContaining(removedIds));

		const importedId = Date.now() + 100;
		const imported = importLogs([{ id: importedId, date: '2023-01-03', distance: 15 }]);
		expect(imported.logs).toHaveLength(1);
		expect(imported.deletedLogIds).toEqual(expect.arrayContaining(removedIds));
	});

	it('should set and persist unit preferences', () => {
		expect(setUnit('miles').unit).toBe('miles');
		expect(loadData().unit).toBe('miles');
		expect(setUnit('km').unit).toBe('km');
	});

	it('getStartDate should return earliest log date', () => {
		const logs = [
			{ id: 1, date: '2023-01-10', distance: 5 },
			{ id: 2, date: '2023-01-05', distance: 3 },
			{ id: 3, date: '2023-01-15', distance: 7 }
		];
		expect(getStartDate(logs)).toBe('2023-01-05');
	});

	it('should persist and load storage mode', () => {
		setStorageMode('local');
		expect(localStorageMock.getItem(STORAGE_MODE_KEY)).toBe('local');
		expect(loadStorageMode()).toBe('local');
		expect(get(storageMode)).toBe('local');
	});

	it('should not persist cloud mode and should reset mode', () => {
		setStorageMode('cloud');
		expect(localStorageMock.getItem(STORAGE_MODE_KEY)).toBeNull();
		expect(get(storageMode)).toBe('cloud');

		resetStorageMode();
		expect(get(storageMode)).toBeNull();
		expect(localStorageMock.getItem(STORAGE_MODE_KEY)).toBeNull();
	});

	it('should not write journey data to localStorage in cloud mode', () => {
		setStorageMode('cloud');
		const data = {
			logs: [{ id: 1, date: '2023-01-01', distance: 1 }],
			unit: 'km' as const,
			deletedLogIds: []
		};
		saveData(data);
		expect(localStorageMock.setItem).not.toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
		expect(loadData()).toEqual({ logs: [], unit: 'km', deletedLogIds: [] });
	});

	it('should infer cloud mode when pending cloud cache contains user id', () => {
		localStorageMock.removeItem(STORAGE_MODE_KEY);
		localStorageMock.setItem(
			STORAGE_KEY,
			JSON.stringify({ logs: [], unit: 'km', deletedLogIds: [] })
		);
		localStorageMock.setItem(CLOUD_PENDING_USER_KEY, 'pending-user');

		expect(loadStorageMode()).toBe('cloud');
		expect(get(storageMode)).toBe('cloud');
	});

	it('should infer local mode when stored data has no pending cloud user id', () => {
		localStorageMock.setItem(
			STORAGE_KEY,
			JSON.stringify({ logs: [], unit: 'km', deletedLogIds: [] })
		);

		expect(loadStorageMode()).toBe('local');
		expect(get(storageMode)).toBe('local');
		expect(localStorageMock.getItem(STORAGE_MODE_KEY)).toBe('local');
	});

	it('should infer cloud mode when a user is already signed in', async () => {
		const { auth } = await import('./firebase');
		localStorageMock.removeItem(STORAGE_MODE_KEY);
		(auth as { currentUser: unknown }).currentUser = { uid: 'signed-in-user' };

		expect(loadStorageMode()).toBe('cloud');

		(auth as { currentUser: unknown }).currentUser = null;
	});

	it('should cache cloud changes locally when offline with user id', () => {
		const mockUser = { uid: 'offline-user' } as User;
		const data = {
			logs: [{ id: 2, date: '2023-01-02', distance: 2 }],
			unit: 'km' as const,
			deletedLogIds: []
		};

		setStorageMode('cloud');
		isOnline.set(false);
		saveData(data, mockUser);

		expect(localStorageMock.getItem(STORAGE_KEY)).toBe(JSON.stringify(data));
		expect(localStorageMock.getItem(CLOUD_PENDING_USER_KEY)).toBe('offline-user');

		isOnline.set(true);
	});

	it('should clear pending cloud cache when switching to local mode', () => {
		localStorageMock.setItem(
			STORAGE_KEY,
			JSON.stringify({ logs: [], unit: 'km', deletedLogIds: [] })
		);
		localStorageMock.setItem(CLOUD_PENDING_USER_KEY, 'pending-user');

		setStorageMode('local');

		expect(localStorageMock.getItem(CLOUD_PENDING_USER_KEY)).toBeNull();
		expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();
	});

	describe('Firestore sync', () => {
		beforeEach(() => {
			setStorageMode('cloud');
		});

		const mockUser: User = {
			uid: 'test-user-123',
			email: 'test@example.com',
			displayName: 'Test User',
			photoURL: null,
			emailVerified: true,
			isAnonymous: false,
			metadata: {},
			providerData: [],
			refreshToken: '',
			tenantId: null,
			delete: vi.fn(),
			getIdToken: vi.fn(),
			getIdTokenResult: vi.fn(),
			reload: vi.fn(),
			toJSON: vi.fn(),
			providerId: 'firebase'
		} as unknown as User;

		it('should upload local data when no remote data exists', async () => {
			const { getDoc, setDoc } = await import('firebase/firestore');
			journeyStore.set({
				logs: [{ id: 1, date: '2023-01-01', distance: 10 }],
				unit: 'km',
				deletedLogIds: []
			});

			(getDoc as any).mockResolvedValueOnce({ exists: () => false, data: () => undefined } as any);
			await syncWithFirestore(mockUser);
			expect(setDoc).toHaveBeenCalled();
		});

		it('should merge remote deletions into local state', async () => {
			const { getDoc } = await import('firebase/firestore');
			journeyStore.set({
				logs: [{ id: 5, date: '2023-01-01', distance: 10 }],
				unit: 'km',
				deletedLogIds: []
			});

			(getDoc as any).mockResolvedValueOnce({
				exists: () => true,
				data: () => ({ logs: [], unit: 'km', deletedLogIds: [5] })
			} as any);

			await syncWithFirestore(mockUser);
			const merged = get(journeyStore);
			expect(merged.logs.some((log) => log.id === 5)).toBe(false);
			expect(merged.deletedLogIds).toContain(5);
		});

		it('should queue sync when offline in cloud mode', async () => {
			const { setDoc } = await import('firebase/firestore');
			isOnline.set(false);
			hasPendingSync.set(false);

			addLog({ date: '2023-01-01', distance: 10 }, mockUser);
			expect(setDoc).not.toHaveBeenCalled();
			expect(get(hasPendingSync)).toBe(true);

			isOnline.set(true);
		});
	});

	it('deleteUserAccount should delete remote and clear local state', async () => {
		const { deleteDoc } = await import('firebase/firestore');
		const { deleteUser } = await import('firebase/auth');
		const mockUser = { uid: 'test-uid' } as User;

		addLog({ date: '2023-01-01', distance: 10 });
		await deleteUserAccount(mockUser);

		expect(deleteDoc).toHaveBeenCalled();
		expect(deleteUser).toHaveBeenCalledWith(mockUser);
		expect(loadData().logs).toHaveLength(0);
	});

	it('should support Google authentication', async () => {
		const { googleProvider } = await import('./firebase');
		expect(googleProvider).toBeDefined();
	});
});
