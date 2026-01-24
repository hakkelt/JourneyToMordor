import { describe, it, expect } from 'vitest';
import { convertToCSV, parseCSV } from './csv';
import type { LogEntry } from './storage';

describe('convertToCSV', () => {
	const mockLogs: LogEntry[] = [
		{
			id: 1,
			date: '2024-01-01',
			distance: 10,
			note: 'First run'
		},
		{
			id: 2,
			date: '2024-01-02',
			distance: 5.5,
			note: 'Recovery walk with "quotes"'
		}
	];

	it('should generate valid CSV header', () => {
		const csv = convertToCSV([], 'km');
		expect(csv).toBe('Date,Distance (km),Note');
	});

	it('should format logs correctly in km', () => {
		const csv = convertToCSV(mockLogs, 'km');
		const lines = csv.split('\n');

		expect(lines[0]).toBe('Date,Distance (km),Note');
		expect(lines[1]).toBe('2024-01-01,10.00,"First run"');
		expect(lines[2]).toBe('2024-01-02,5.50,"Recovery walk with ""quotes"""');
	});

	it('should convert distances when unit is miles', () => {
		// 10 km = 6.21 miles
		// 5.5 km = 3.42 miles
		const csv = convertToCSV(mockLogs, 'miles');
		const lines = csv.split('\n');

		expect(lines[0]).toBe('Date,Distance (miles),Note');
		// We expect 2 decimal places
		expect(lines[1]).toContain('6.21');
		expect(lines[2]).toContain('3.42');
	});

	it('should handle empty notes', () => {
		const logWithEmptyNote: LogEntry[] = [
			{
				id: 3,
				date: '2024-01-03',
				distance: 1,
				note: ''
			}
		];

		const csv = convertToCSV(logWithEmptyNote, 'km');
		expect(csv.split('\n')[1]).toBe('2024-01-03,1.00,');
	});

	it('should sort logs by date', () => {
		const unsortedLogs: LogEntry[] = [
			{ id: 2, date: '2024-01-02', distance: 5, note: '' },
			{ id: 1, date: '2024-01-01', distance: 5, note: '' }
		];

		const csv = convertToCSV(unsortedLogs, 'km');
		const lines = csv.split('\n');

		expect(lines[1]).toContain('2024-01-01');
		expect(lines[2]).toContain('2024-01-02');
	});
});

describe('parseCSV', () => {
	it('should parse valid CSV content correctly', () => {
		const csv = `Date,Distance (km),Note
2024-01-01,10,First run
2024-01-02,5.5,"Note with comma, and quotes"`;
		const logs = parseCSV(csv);

		expect(logs).toHaveLength(2);

		expect(logs[0].date).toBe('2024-01-01');
		expect(logs[0].distance).toBe(10);
		expect(logs[0].note).toBe('First run');

		expect(logs[1].date).toBe('2024-01-02');
		expect(logs[1].distance).toBe(5.5);
		expect(logs[1].note).toBe('Note with comma, and quotes');
	});

	it('should convert miles to km based on header', () => {
		// 10 miles = 16.0934 km
		const csv = `Date,Distance (miles),Note
2024-01-01,10,Run`;
		const logs = parseCSV(csv);

		expect(logs).toHaveLength(1);
		expect(logs[0].distance).toBeCloseTo(16.0934, 3);
	});

	it('should throw error for missing headers', () => {
		const csv = `Just some text
2024-01-01,10,Run`;
		expect(() => parseCSV(csv)).toThrow('Missing required columns');
	});

	it('should error on invalid date', () => {
		const csv = `Date,Distance (km)
NotADate,10`;
		expect(() => parseCSV(csv)).toThrow('Invalid date');
	});

	it('should handle missing note column gracefully', () => {
		const csv = `Date,Distance (km)
2024-01-01,5`;
		const logs = parseCSV(csv);
		expect(logs[0].note).toBeUndefined();
	});
});
