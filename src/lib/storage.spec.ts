import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadData, saveData, addLog, deleteLog, getStartDate, STORAGE_KEY } from './storage';

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
	});

	it('should return default state when local storage is empty', () => {
		const data = loadData();
		expect(data.logs).toEqual([]);
	});

	it('should save data correctly', () => {
		const data = {
			logs: []
		};
		saveData(data);
		expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(data));
	});

	it('should load saved data', () => {
		const saved = {
			logs: [{ id: 123, date: '2023-01-01', distance: 5 }]
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
});
