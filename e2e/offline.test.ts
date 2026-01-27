import { test, expect } from '@playwright/test';

test.describe('Offline Mode', () => {
	test('should disable footer links and show banner when offline', async ({ page }) => {
		await page.goto('/');

		// Wait for initial load
		await expect(page.getByRole('heading', { name: 'Welcome, Ringbearer' })).toBeVisible();

		// Simulate offline
		await page.context().setOffline(true);

		// Verify Footer links are disabled
		const githubLink = page.getByRole('link', { name: 'GitHub Repository' });
		await expect(githubLink).toHaveClass(/opacity-50/);
		await expect(githubLink).toHaveClass(/pointer-events-none/);

		const discussionsLink = page.getByRole('link', { name: 'Discussions' });
		await expect(discussionsLink).toHaveClass(/opacity-50/);
		await expect(discussionsLink).toHaveClass(/pointer-events-none/);

		const issuesLink = page.getByRole('link', { name: 'Bug Reports' });
		await expect(issuesLink).toHaveClass(/opacity-50/);
		await expect(issuesLink).toHaveClass(/pointer-events-none/);
	});

	test('should allow adding logs while offline and persist them', async ({ page }) => {
		await page.goto('/logs');

		// Ensure page is loaded
		await expect(page.getByRole('heading', { name: 'Log Journey' })).toBeVisible();

		// Monitor for banner
		const offlineBanner = page.getByText('You are currently offline');

		// Simulate offline
		await page.context().setOffline(true);

		// For anonymous users, the banner should NOT appear
		await expect(offlineBanner).toBeHidden();

		// Verify Auth button shows Offline status
		// await expect(page.getByRole('button', { name: 'Offline' })).toBeVisible();

		// Add log entry
		await page.getByLabel('Date').fill('2023-01-15');
		await page.getByLabel('Distance').fill('10');
		await page.getByRole('button', { name: 'Add Entry' }).click();

		// Verify log added to table (Note: distance is fixed to 2 decimals, date is YYYY-MM-DD)
		await expect(page.getByRole('cell', { name: '10.00 km' })).toBeVisible();
		await expect(page.getByRole('cell', { name: '2023-01-15' })).toBeVisible();

		// Verify persistence on reload
		await page.context().setOffline(false);
		await page.reload();

		// Data should still be there (persisted in localStorage)
		await expect(page.getByRole('cell', { name: '10.00 km' })).toBeVisible();
	});
});
