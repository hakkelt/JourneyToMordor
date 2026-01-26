import { expect, test } from '@playwright/test';

test.describe('Unit Selection', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();
	});

	test('should display all distances in km by default', async ({ page }) => {
		// Add a log entry
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
		await page.getByLabel('Distance (km)').fill('10');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Verify history shows km
		await expect(page.getByText('10.00 km')).toBeVisible();

		// Switch to Dashboard
		await page.getByRole('link', { name: 'Dashboard' }).click();

		// Verify dashboard stats show km
		await expect(page.getByText('10.0 km')).toBeVisible();
	});

	test('should switch all distance displays to miles when unit is changed', async ({ page }) => {
		// Add a log entry in km
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
		await page.getByLabel('Distance (km)').fill('10');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Verify initial display in km
		await expect(page.getByText('10.00 km')).toBeVisible();

		// Switch to miles using header toggle
		await page.getByRole('button', { name: 'Set units to miles' }).click();

		// Verify history updates to miles (10 km ≈ 6.21 miles)
		await expect(page.getByText(/6\.21 miles/)).toBeVisible();
		await expect(page.getByText('10.00 km')).not.toBeVisible();

		// Verify input label changed
		await expect(page.getByLabel('Distance (miles)')).toBeVisible();

		// Switch to Dashboard
		await page.getByRole('link', { name: 'Dashboard' }).click();

		// Verify dashboard stats show miles
		await expect(page.getByText(/6\.2 miles/)).toBeVisible();
	});

	test('should convert miles to km when logging with miles selected', async ({ page }) => {
		// Switch to miles first
		await page.getByRole('button', { name: 'Set units to miles' }).click();

		// Add entry in miles
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await page.getByLabel('Distance (miles)').fill('10');
		await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Verify it shows as 10 miles in history
		await expect(page.getByText('10.00 miles')).toBeVisible();

		// Switch back to km
		await page.getByRole('button', { name: 'Set units to kilometers' }).click();

		// Verify it now shows as ~16.09 km (10 miles * 1.60934)
		await expect(page.getByText(/16\.09 km/)).toBeVisible();
	});

	test('should persist unit selection across page reloads', async ({ page }) => {
		// Switch to miles
		await page.getByRole('button', { name: 'Set units to miles' }).click();

		// Add an entry
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await page.getByLabel('Distance (miles)').fill('5');
		await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Reload page
		await page.reload();

		// Verify miles is still selected
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await expect(page.getByLabel('Distance (miles)')).toBeVisible();
		await expect(page.getByText('5.00 miles')).toBeVisible();
	});

	test('should update chart axis labels when unit changes', async ({ page }) => {
		// Add an entry
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
		await page.getByLabel('Distance (km)').fill('10');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Go to Dashboard
		await page.getByRole('link', { name: 'Dashboard' }).click();

		// Wait for chart to render
		await page.waitForTimeout(500);

		// Switch to miles
		await page.getByRole('button', { name: 'Set units to miles' }).click();

		// Wait for chart to update
		await page.waitForTimeout(500);

		// Verify chart updated (check canvas exists - detailed chart inspection would require more complex testing)
		const canvas = page.locator('canvas');
		await expect(canvas).toBeVisible();
	});

	test('should handle multiple log entries with unit switching', async ({ page }) => {
		// Add first entry in km
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await page.getByLabel('Date').fill('2026-01-20');
		await page.getByLabel('Distance (km)').fill('5');
		await page.getByLabel('Note').fill('Morning walk');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Switch to miles
		await page.getByRole('button', { name: 'Set units to miles' }).click();

		// Add second entry in miles
		await page.getByLabel('Date').fill('2026-01-21');
		await page.getByLabel('Distance (miles)').fill('3');
		await page.getByLabel('Note').fill('Evening run');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Verify both entries show in miles
		await expect(page.getByText('3.00 miles')).toBeVisible();
		await expect(page.getByText(/3\.11 miles/)).toBeVisible(); // 5 km ≈ 3.11 miles

		// Switch back to km
		await page.getByRole('button', { name: 'Set units to kilometers' }).click();

		// Verify both entries show in km
		await expect(page.getByText('5.00 km')).toBeVisible();
		await expect(page.getByText(/4\.83 km/)).toBeVisible(); // 3 miles ≈ 4.83 km

		// Go to Dashboard and verify total
		await page.getByRole('link', { name: 'Dashboard' }).click();

		// Total should be ~9.83 km (5 + 4.83)
		await expect(page.getByText(/9\.8 km/)).toBeVisible();
	});

	test('should show correct unit in dashboard stats after switching', async ({ page }) => {
		// Add entry
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
		await page.getByLabel('Distance (km)').fill('100');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Go to Dashboard
		await page.getByRole('link', { name: 'Dashboard' }).click();

		// Verify initial km display
		await expect(page.getByText('Total Distance').first()).toBeVisible();
		await expect(page.getByText('100.0 km')).toBeVisible();

		// Switch to miles
		await page.getByRole('button', { name: 'Set units to miles' }).click();

		// Verify all stats updated to miles
		await expect(page.getByText(/62\.1 miles/)).toBeVisible();
	});

	test('should maintain unit selection when navigating between tabs', async ({ page }) => {
		// Switch to miles
		await page.getByRole('button', { name: 'Set units to miles' }).click();

		// Go to Log Journey tab
		await page.getByRole('link', { name: 'Logs' }).first().click();
		await expect(page.getByLabel('Distance (miles)')).toBeVisible();

		// Go back to Dashboard
		await page.getByRole('link', { name: 'Dashboard' }).click();

		// Go to Log Journey again
		await page.getByRole('link', { name: 'Logs' }).first().click();

		// Should still be miles
		await expect(page.getByLabel('Distance (miles)')).toBeVisible();

		// Switch to km
		await page.getByRole('button', { name: 'Set units to kilometers' }).click();

		// Navigate between tabs
		await page.getByRole('link', { name: 'Dashboard' }).click();
		await page.getByRole('link', { name: 'Logs' }).first().click();

		// Should be km
		await expect(page.getByLabel('Distance (km)')).toBeVisible();
	});
});
