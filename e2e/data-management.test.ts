import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Data Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('should delete all logs', async ({ page }) => {
		// 1. Add some logs
		await page.getByRole('link', { name: 'Logs' }).first().click();

		await page.getByLabel('Date').fill('2024-01-01');
		await page.getByLabel('Distance (km)').fill('10');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		await page.getByLabel('Date').fill('2024-01-02');
		await page.getByLabel('Distance (km)').fill('5');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Verify logs exist
		await expect(page.getByText('10.00 km')).toBeVisible();
		await expect(page.getByText('5.00 km')).toBeVisible();

		// 2. Click Delete All
		await page.getByRole('button', { name: 'Delete All' }).click();

		// 3. Verify confirmation modal appears
		await expect(page.getByText('Warning: Data Loss')).toBeVisible();

		// 4. Confirm delete
		// Target the button inside the modal (using the modal text to anchor, or the fixed class)
		await page.locator('.fixed').getByRole('button', { name: 'Delete All' }).click();

		// 5. Verify logs are gone
		await expect(page.getByText('No entries yet')).toBeVisible();
		await expect(page.getByText('10.00 km')).not.toBeVisible();
	});

	test('should warn when overwriting existing logs with import', async ({ page }) => {
		// 1. Add a dummy log first
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await page.getByLabel('Date').fill('2024-01-01');
		await page.getByLabel('Distance (km)').fill('1');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// 2. Prepare a CSV file
		const csvContent = `Date,Distance (km),Note
2024-03-01,10,Imported run`;
		const testCsvPath = path.resolve('test-import-warn.csv');
		fs.writeFileSync(testCsvPath, csvContent);

		try {
			// 3. Trigger import
			const fileChooserPromise = page.waitForEvent('filechooser');
			await page.getByRole('button', { name: 'Import CSV' }).click();
			const fileChooser = await fileChooserPromise;
			await fileChooser.setFiles(testCsvPath);

			// 4. Verify confirmation modal appears
			await expect(page.getByText('Confirm Import')).toBeVisible();

			// 5. Confirm import
			await page.getByRole('button', { name: 'Import Data' }).click();

			// 6. Verify logs imported
			await expect(page.getByText('Imported run')).toBeVisible();
		} finally {
			if (fs.existsSync(testCsvPath)) fs.unlinkSync(testCsvPath);
		}
	});

	test('should import CSV directly when history is empty', async ({ page }) => {
		const csvContent = `Date,Distance (km),Note
2024-03-01,10,Direct import`;
		const testCsvPath = path.resolve('test-import-direct.csv');
		fs.writeFileSync(testCsvPath, csvContent);

		try {
			await page.getByRole('link', { name: 'Logs' }).first().click();

			const fileChooserPromise = page.waitForEvent('filechooser');
			await page.getByRole('button', { name: 'Import CSV' }).click();
			const fileChooser = await fileChooserPromise;
			await fileChooser.setFiles(testCsvPath);

			// 4. Verify NO confirmation modal (log should appear immediately)
			await expect(page.getByText('Confirm Import')).not.toBeVisible();
			await expect(page.getByText('Direct import')).toBeVisible();
		} finally {
			if (fs.existsSync(testCsvPath)) fs.unlinkSync(testCsvPath);
		}
	});

	test('should import CSV with miles conversion', async ({ page }) => {
		// 1. Prepare CSV with miles
		const csvContent = `Date,Distance (miles),Note
2024-03-01,10,Run in miles`;
		const testCsvPath = path.resolve('test-miles.csv');
		fs.writeFileSync(testCsvPath, csvContent);

		try {
			await page.getByRole('link', { name: 'Logs' }).first().click();

			const fileChooserPromise = page.waitForEvent('filechooser');
			await page.getByRole('button', { name: 'Import CSV' }).click();
			const fileChooser = await fileChooserPromise;
			await fileChooser.setFiles(testCsvPath);

			// No confirmation needed as history is empty

			// 10 miles approx 16.09 km
			await expect(page.getByText('16.09 km')).toBeVisible();
			await expect(page.getByText('Run in miles')).toBeVisible();
		} finally {
			if (fs.existsSync(testCsvPath)) {
				fs.unlinkSync(testCsvPath);
			}
		}
	});
});
