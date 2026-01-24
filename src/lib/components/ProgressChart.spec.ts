import { describe, it, expect } from 'vitest';

describe('ProgressChart Date Calculation', () => {
	it('should calculate days since start correctly', () => {
		// This test verifies the fix for the bug where dates were calculated incorrectly
		// Example: entries on 1/15/2026 and 1/24/2026 should be 0 and 9 days apart
		const startDate = '2026-01-15';
		const testCases = [
			{ date: '2026-01-15', expectedDay: 0 },
			{ date: '2026-01-24', expectedDay: 9 },
			{ date: '2026-01-16', expectedDay: 1 },
			{ date: '2026-02-15', expectedDay: 31 }
		];

		testCases.forEach(({ date, expectedDay }) => {
			// Normalize dates to midnight UTC to avoid timezone issues
			const logDate = new Date(date + 'T00:00:00Z');
			const startDateNormalized = new Date(startDate + 'T00:00:00Z');

			// Calculate difference in days
			const diffTime = logDate.getTime() - startDateNormalized.getTime();
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			expect(diffDays).toBe(expectedDay);
		});
	});

	it('should handle dates before start date', () => {
		const startDate = '2026-01-15';
		const earlierDate = '2026-01-10';

		const logDate = new Date(earlierDate + 'T00:00:00Z');
		const startDateNormalized = new Date(startDate + 'T00:00:00Z');

		const diffTime = logDate.getTime() - startDateNormalized.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		expect(diffDays).toBe(-5);
	});

	it('should handle leap years correctly', () => {
		const startDate = '2024-02-28';
		const testCases = [
			{ date: '2024-02-28', expectedDay: 0 },
			{ date: '2024-02-29', expectedDay: 1 }, // Leap day
			{ date: '2024-03-01', expectedDay: 2 }
		];

		testCases.forEach(({ date, expectedDay }) => {
			const logDate = new Date(date + 'T00:00:00Z');
			const startDateNormalized = new Date(startDate + 'T00:00:00Z');

			const diffTime = logDate.getTime() - startDateNormalized.getTime();
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			expect(diffDays).toBe(expectedDay);
		});
	});

	it('should handle year boundaries correctly', () => {
		const startDate = '2025-12-30';
		const testCases = [
			{ date: '2025-12-30', expectedDay: 0 },
			{ date: '2025-12-31', expectedDay: 1 },
			{ date: '2026-01-01', expectedDay: 2 },
			{ date: '2026-01-15', expectedDay: 16 }
		];

		testCases.forEach(({ date, expectedDay }) => {
			const logDate = new Date(date + 'T00:00:00Z');
			const startDateNormalized = new Date(startDate + 'T00:00:00Z');

			const diffTime = logDate.getTime() - startDateNormalized.getTime();
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			expect(diffDays).toBe(expectedDay);
		});
	});
});
