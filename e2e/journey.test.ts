import { expect, test } from '@playwright/test';

test.describe('Journey to Mordor', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('visitor can log a journey and see progress', async ({ page }) => {
        // 1. Check initial state (Dashboard empty)
        await expect(page.getByRole('heading', { name: 'Welcome, Ringbearer' })).toBeVisible();

        // 2. Switch to Log tab
        await page.getByRole('button', { name: 'Log Journey' }).click();
        await expect(page.getByRole('heading', { name: 'Log Journey' })).toBeVisible();

        // 3. Add an entry
        await page.getByLabel('Date').fill(new Date().toISOString().split('T')[0]);
        await page.getByLabel('Distance (km)').fill('10'); 
        await page.getByLabel('Note').fill('First step');
        await page.getByRole('button', { name: 'Add Entry' }).click();

        // 4. Verify entry in history
        await expect(page.getByText('First step')).toBeVisible();
        await expect(page.getByText('10 km')).toBeVisible();

        // 5. Switch back to Dashboard and verify stats
        await page.getByRole('button', { name: 'Dashboard' }).click();
        
        // Should see dashboard stats instead of welcome message
        await expect(page.getByText('Total Distance')).toBeVisible();
        await expect(page.getByText('10.0 km')).toBeVisible(); 
        await expect(page.getByText('Tookland')).toBeVisible(); // Current location (8km passed)
        
        // 6. Delete entry
        await page.getByRole('button', { name: 'Log Journey' }).click();
        await page.getByRole('button', { name: 'Delete entry' }).click();
        await expect(page.getByText('First step')).not.toBeVisible();
        
        // 7. Verify Dashboard is empty again
        await page.getByRole('button', { name: 'Dashboard' }).click();
        await expect(page.getByRole('heading', { name: 'Welcome, Ringbearer' })).toBeVisible();
    });
});
