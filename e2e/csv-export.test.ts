import { expect, test } from '@playwright/test';

test.describe('CSV Export', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('should successfully download CSV file with log entries', async ({ page }) => {
		// 1. Navigate to Log Journey and add an entry
		await page.getByRole('button', { name: 'Log Journey' }).first().click();
		await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
		await page.getByLabel('Distance (km)').fill('10');
		await page.getByLabel('Note').fill('Test export');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Wait for entry to appear in history to ensure state is updated
		await expect(page.getByText('Test export')).toBeVisible();

		// 2. Setup download listener
		const downloadPromise = page.waitForEvent('download');

		// 3. Click download button
		await page.getByRole('button', { name: 'Download log entries as CSV' }).click();

		// 4. Wait for download to complete
		const download = await downloadPromise;
		const suggestedFilename = download.suggestedFilename();

		// Verify filename format
		expect(suggestedFilename).toMatch(/journey-to-mordor-\d{4}-\d{2}-\d{2}\.csv/);

		// 5. Read stream to check content
		const stream = await download.createReadStream();
		// In a real browser environment we could save looking at the file stream,
		// but checking the stream content is good for now.
		const content = await new Promise<string>((resolve, reject) => {
			const chunks: Buffer[] = [];
			stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
			stream.on('error', reject);
			stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
		});

		// Verify CSV content
		expect(content).toContain('Date,Distance (km),Note');
		expect(content).toContain('10.00,"Test export"');
	});

	test('should verify download button visibility', async ({ page }) => {
		await page.getByRole('button', { name: 'Log Journey' }).first().click();

		// Button should not be visible initially (no logs)
		await expect(
			page.getByRole('button', { name: 'Download log entries as CSV' })
		).not.toBeVisible();

		// Add entry
		await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
		await page.getByLabel('Distance (km)').fill('5');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Wait for data to update
		await expect(page.getByText('5.00 km')).toBeVisible();

		// Button should now be visible
		await expect(page.getByRole('button', { name: 'Download log entries as CSV' })).toBeVisible();

		// Delete entry
		await page.getByRole('button', { name: 'Delete entry' }).click();

		// Button should disappear
		await expect(
			page.getByRole('button', { name: 'Download log entries as CSV' })
		).not.toBeVisible();
	});
});
