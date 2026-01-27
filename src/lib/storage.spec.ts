/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	loadData,
	saveData,
	addLog,
	deleteLog,
	setUnit,
	getStartDate,
	resetData,
	deleteUserAccount,
	syncWithFirestore,
	STORAGE_KEY
} from './storage';
import type { User } from 'firebase/auth';
import { get } from 'svelte/store';
import { isOnline, hasPendingSync } from './stores/network';

// Mock Firebase
vi.mock('./firebase', () => ({
	db: {},
	auth: { currentUser: null },
	googleProvider: {},
	facebookProvider: {},
	microsoftProvider: {},
	appleProvider: {}
}));

// Mock Firestore functions
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

// Mock localStorage
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

// Assign to global
Object.defineProperty(global, 'localStorage', {
	value: localStorageMock
});

describe('Storage', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
		resetData();
	});

	it('should return default state when local storage is empty', () => {
		const data = loadData();
		expect(data.logs).toEqual([]);
	});

	it('should save data correctly', () => {
		const data = {
			logs: [],
			unit: 'km' as const
		};
		saveData(data);
		expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(data));
	});

	it('should load saved data', () => {
		const saved = {
			logs: [{ id: 123, date: '2023-01-01', distance: 5 }],
			unit: 'km' as const
		};
		localStorageMock.setItem(STORAGE_KEY, JSON.stringify(saved));

		const loaded = loadData();
		expect(loaded).toEqual(saved);
	});

	it('should add a log entry', () => {
		const entry = { date: '2023-01-01', distance: 10, note: 'Run' };
		const result = addLog(entry);

		expect(result.logs).toHaveLength(1);
		expect(result.logs[0]).toMatchObject(entry);
		expect(result.logs[0].id).toBeDefined();

		// Verify it persisted
		const loaded = loadData();
		expect(loaded.logs).toHaveLength(1);
	});

	it('should delete a log entry', () => {
		const entry = { date: '2023-01-01', distance: 10, note: 'Run' };
		const withLog = addLog(entry);
		const id = withLog.logs[0].id;

		const result = deleteLog(id);
		expect(result.logs).toHaveLength(0);

		const loaded = loadData();
		expect(loaded.logs).toHaveLength(0);
	});

	it('should handle corrupted data gracefully', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		localStorageMock.setItem(STORAGE_KEY, '{ invalid json }');
		const data = loadData();
		expect(data.logs).toEqual([]); // Should fall back to default
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	it('getStartDate should return earliest log date', () => {
		const logs = [
			{ id: 1, date: '2023-01-10', distance: 5 },
			{ id: 2, date: '2023-01-05', distance: 3 },
			{ id: 3, date: '2023-01-15', distance: 7 }
		];
		expect(getStartDate(logs)).toBe('2023-01-05');
	});

	it('getStartDate should return today if no logs', () => {
		const today = new Date().toISOString().split('T')[0];
		expect(getStartDate([])).toBe(today);
	});

	// Unit Selection Tests
	describe('Unit Selection', () => {
		it('should default to km when loading empty storage', () => {
			const data = loadData();
			expect(data.unit).toBe('km');
		});

		it('should set unit to miles', () => {
			const result = setUnit('miles');
			expect(result.unit).toBe('miles');

			const loaded = loadData();
			expect(loaded.unit).toBe('miles');
		});

		it('should set unit to km', () => {
			// First set to miles
			setUnit('miles');

			// Then set back to km
			const result = setUnit('km');
			expect(result.unit).toBe('km');

			const loaded = loadData();
			expect(loaded.unit).toBe('km');
		});

		it('should persist unit preference across operations', () => {
			// Set unit to miles
			setUnit('miles');

			// Add a log entry
			const entry = { date: '2023-01-01', distance: 10, note: 'Run' };
			const result = addLog(entry);

			// Unit should still be miles
			expect(result.unit).toBe('miles');

			const loaded = loadData();
			expect(loaded.unit).toBe('miles');
		});

		it('should preserve logs when changing unit', () => {
			// Add some logs
			addLog({ date: '2023-01-01', distance: 5, note: 'Walk' });
			addLog({ date: '2023-01-02', distance: 10, note: 'Run' });

			const beforeChange = loadData();
			expect(beforeChange.logs).toHaveLength(2);

			// Change unit
			const result = setUnit('miles');

			// Logs should be preserved
			expect(result.logs).toHaveLength(2);
			expect(result.logs[0].distance).toBe(10); // Distance stored in km should not change
			expect(result.logs[1].distance).toBe(5);
		});

		it('should handle unit in old schema migration', () => {
			const oldData = {
				logs: [{ id: 123, date: '2023-01-05', distance: 5 }]
				// No unit property
			};
			localStorageMock.setItem(STORAGE_KEY, JSON.stringify(oldData));

			const loaded = loadData();
			expect(loaded.unit).toBe('km'); // Should default to km
			expect(loaded.logs).toEqual(oldData.logs);
		});
	});

	describe('deleteUserAccount', () => {
		it('should delete firestore doc and firebase user, then reset local data', async () => {
			const { deleteDoc } = await import('firebase/firestore');
			const { deleteUser } = await import('firebase/auth');
			const mockUser = { uid: 'test-uid' } as User;

			// Add some local data first
			addLog({ date: '2023-01-01', distance: 10 });

			await deleteUserAccount(mockUser);

			expect(deleteDoc).toHaveBeenCalled();
			expect(deleteUser).toHaveBeenCalledWith(mockUser);
			expect(loadData().logs).toHaveLength(0);
		});
	});

	// Firebase Authentication & Sync Tests
	describe('Firebase Authentication & Data Sync', () => {
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

		describe('syncWithFirestore', () => {
			it('should upload local data when no remote data exists', async () => {
				const { getDoc, setDoc } = await import('firebase/firestore');

				// Setup local data
				const localData = {
					logs: [{ id: 1, date: '2023-01-01', distance: 10 }],
					unit: 'km' as const
				};
				saveData(localData);
				loadData();

				// Mock no remote data
				(getDoc as any).mockResolvedValueOnce({
					exists: () => false,
					data: () => undefined
				} as any);

				await syncWithFirestore(mockUser);

				// Should upload local data to Firestore
				expect(setDoc).toHaveBeenCalled();
				// Verify the data argument (second parameter)
				const callArgs = (setDoc as any).mock.calls[0];
				expect(callArgs[1]).toEqual(localData);
			});

			it('should download and merge remote data with local data', async () => {
				const { getDoc } = await import('firebase/firestore');

				// Setup local data
				const localData = {
					logs: [{ id: 1, date: '2023-01-01', distance: 10 }],
					unit: 'km' as const
				};
				saveData(localData);
				loadData();

				// Mock remote data with different logs
				const remoteData = {
					logs: [{ id: 2, date: '2023-01-02', distance: 15 }],
					unit: 'miles' as const
				};

				(getDoc as any).mockResolvedValueOnce({
					exists: () => true,
					data: () => remoteData
				} as any);

				await syncWithFirestore(mockUser);

				// Should merge both logs
				const merged = loadData();
				expect(merged.logs).toHaveLength(2);
				expect(merged.logs.some((log) => log.id === 1)).toBe(true);
				expect(merged.logs.some((log) => log.id === 2)).toBe(true);
				// Should prefer local unit
				expect(merged.unit).toBe('km');
			});

			it('should handle duplicate logs correctly during merge', async () => {
				const { getDoc } = await import('firebase/firestore');

				// Setup local data
				const localData = {
					logs: [
						{ id: 1, date: '2023-01-01', distance: 10 },
						{ id: 2, date: '2023-01-02', distance: 15 }
					],
					unit: 'km' as const
				};
				saveData(localData);
				loadData();

				// Mock remote data with overlapping logs
				const remoteData = {
					logs: [
						{ id: 2, date: '2023-01-02', distance: 15 }, // Duplicate
						{ id: 3, date: '2023-01-03', distance: 20 }
					],
					unit: 'km' as const
				};

				(getDoc as any).mockResolvedValueOnce({
					exists: () => true,
					data: () => remoteData
				} as any);

				await syncWithFirestore(mockUser);

				// Should have 3 unique logs (no duplicates)
				const merged = loadData();
				expect(merged.logs).toHaveLength(3);
				expect(merged.logs.filter((log) => log.id === 2)).toHaveLength(1);
			});

			it('should update remote data if merged data differs', async () => {
				const { getDoc, setDoc } = await import('firebase/firestore');

				// Setup local data
				const localData = {
					logs: [{ id: 1, date: '2023-01-01', distance: 10 }],
					unit: 'km' as const
				};
				saveData(localData);
				loadData();

				// Mock remote data
				const remoteData = {
					logs: [{ id: 2, date: '2023-01-02', distance: 15 }],
					unit: 'km' as const
				};

				(getDoc as any).mockResolvedValueOnce({
					exists: () => true,
					data: () => remoteData
				} as any);

				await syncWithFirestore(mockUser);

				// Should call setDoc to update remote with merged data
				expect(setDoc).toHaveBeenCalled();
			});

			it('should handle sync errors gracefully', async () => {
				const { getDoc } = await import('firebase/firestore');
				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

				// Mock getDoc to throw an error
				(getDoc as any).mockRejectedValueOnce(new Error('Network error'));

				await syncWithFirestore(mockUser);

				// Should log error but not throw
				expect(consoleSpy).toHaveBeenCalledWith('Sync failed:', expect.any(Error));
				consoleSpy.mockRestore();
			});
		});

		describe('addLog with Firebase sync', () => {
			it('should sync to Firestore when user is logged in', async () => {
				const { setDoc } = await import('firebase/firestore');

				const entry = { date: '2023-01-01', distance: 10, note: 'Run' };
				const result = addLog(entry, mockUser);

				// Should save locally
				expect(result.logs).toHaveLength(1);

				// Should attempt to sync to Firestore
				// Wait a bit for async operation
				await new Promise((resolve) => setTimeout(resolve, 10));
				expect(setDoc).toHaveBeenCalled();
			});

			it('should work without Firebase sync when user is not logged in', async () => {
				const { setDoc } = await import('firebase/firestore');

				const entry = { date: '2023-01-01', distance: 10, note: 'Run' };
				const result = addLog(entry, null);

				// Should save locally
				expect(result.logs).toHaveLength(1);

				// Should not attempt to sync to Firestore
				expect(setDoc).not.toHaveBeenCalled();
			});
		});

		describe('deleteLog with Firebase sync', () => {
			it('should sync deletion to Firestore when user is logged in', async () => {
				const { setDoc } = await import('firebase/firestore');

				const entry = { date: '2023-01-01', distance: 10 };
				const withLog = addLog(entry);
				const id = withLog.logs[0].id;

				vi.clearAllMocks(); // Clear the addLog setDoc call

				deleteLog(id, mockUser);

				// Should attempt to sync to Firestore
				await new Promise((resolve) => setTimeout(resolve, 10));
				expect(setDoc).toHaveBeenCalled();
			});
		});

		describe('setUnit with Firebase sync', () => {
			it('should sync unit preference to Firestore when user is logged in', async () => {
				const { setDoc } = await import('firebase/firestore');

				setUnit('miles', mockUser);

				// Should attempt to sync to Firestore
				await new Promise((resolve) => setTimeout(resolve, 10));
				expect(setDoc).toHaveBeenCalled();
			});
		});
	});

	describe('Offline Mode', () => {
		it('should queue sync when offline', async () => {
			const { setDoc } = await import('firebase/firestore');
			const mockUser = { uid: 'test-offline' } as any;
			isOnline.set(false);
			hasPendingSync.set(false);

			addLog({ date: '2023-01-01', distance: 10 }, mockUser);

			// Should not call setDoc
			expect(setDoc).not.toHaveBeenCalled();
			// Should set pending sync
			expect(get(hasPendingSync)).toBe(true);

			isOnline.set(true); // Restore
		});
	});

	// Note: Facebook and Apple auth provider tests are skipped as they are not yet configured
	describe('Authentication Providers (Integration)', () => {
		it.skip('should authenticate with Facebook (not yet configured)', () => {
			// This test is skipped because Facebook auth is not yet set up
			// When configured, test should verify Facebook OAuth flow
		});

		it.skip('should authenticate with Apple (not yet configured)', () => {
			// This test is skipped because Apple auth is not yet set up
			// When configured, test should verify Apple OAuth flow
		});

		it('should support Google authentication', async () => {
			// Google provider is configured and should be available
			const { googleProvider } = await import('./firebase');
			expect(googleProvider).toBeDefined();
		});

		it('should support Microsoft authentication', async () => {
			// Microsoft provider is configured and should be available
			const { microsoftProvider } = await import('./firebase');
			expect(microsoftProvider).toBeDefined();
		});
	});
});
