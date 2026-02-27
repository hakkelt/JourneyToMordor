import { expect, test, type Page } from '@playwright/test';

const STORAGE_KEY = 'mordor_tracker_v1';
const STORAGE_MODE_KEY = 'mordor_storage_mode_v1';
const CLOUD_PENDING_USER_KEY = 'mordor_pending_cloud_user_v1';

const emptyData = JSON.stringify({ logs: [], unit: 'km', deletedLogIds: [] });

/**
 * Adds an init script to the page that mocks `window.matchMedia` so the app
 * treats itself as running in PWA standalone (installed) mode. The script
 * executes before any page scripts on every navigation/reload for the
 * lifetime of the test, accurately replicating what the browser reports when
 * the app is launched from the home screen.
 */
async function mockStandaloneMode(page: Page) {
	await page.addInitScript(() => {
		Object.defineProperty(window, 'matchMedia', {
			writable: true,
			configurable: true,
			value: (query: string) => ({
				matches: query === '(display-mode: standalone)',
				media: query,
				onchange: null,
				addListener: () => {},
				removeListener: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: () => false
			})
		});
	});
}

test.describe('Installed PWA – UI descriptions', () => {
	test('should show installed-specific cloud mode description on welcome page', async ({
		page
	}) => {
		await mockStandaloneMode(page);
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		await expect(
			page.getByText(/Data kept in cloud and on this device \(tied to your account\)/)
		).toBeVisible();
	});

	test('should show standard cloud mode description on welcome page when not installed', async ({
		page
	}) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		await expect(
			page.getByText(/All data kept in cloud, except when the device goes offline/)
		).toBeVisible();
	});

	test('should show installed-specific cloud mode description on My Data page', async ({
		page
	}) => {
		await mockStandaloneMode(page);
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		// Choose local mode to unlock My Data navigation
		await page.getByRole('button', { name: 'Choose local mode' }).click();
		await page.getByRole('link', { name: 'My Data' }).first().click();

		await expect(
			page.getByText(/Data kept in cloud and on this device \(tied to your account/)
		).toBeVisible();
	});

	test('should show standard cloud mode description on My Data page when not installed', async ({
		page
	}) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		await page.getByRole('button', { name: 'Choose local mode' }).click();
		await page.getByRole('link', { name: 'My Data' }).first().click();

		await expect(
			page.getByText(/All data kept in cloud, except when the device goes offline/)
		).toBeVisible();
	});

	test('should not show Install App prompt in footer when in standalone mode', async ({ page }) => {
		await mockStandaloneMode(page);
		await page.goto('/');

		await expect(
			page.getByRole('button', { name: /Install App|Install via Browser Menu/ })
		).not.toBeVisible();
	});
});

test.describe('Installed PWA – localStorage persistence', () => {
	test('should preserve pending cloud cache across reload when in standalone mode', async ({
		page
	}) => {
		await mockStandaloneMode(page);
		await page.goto('/');

		// Simulate pre-existing installed-user cache (as would be set by syncWithFirestore)
		await page.evaluate(
			({ storageKey, pendingKey, data, userId }) => {
				localStorage.setItem(storageKey, data);
				localStorage.setItem(pendingKey, userId);
			},
			{
				storageKey: STORAGE_KEY,
				pendingKey: CLOUD_PENDING_USER_KEY,
				data: emptyData,
				userId: 'installed-user-123'
			}
		);

		await page.reload();

		// After reload, the pending cloud user key should still be present
		const pendingUser = await page.evaluate(
			(key) => localStorage.getItem(key),
			CLOUD_PENDING_USER_KEY
		);
		expect(pendingUser).toBe('installed-user-123');

		const storedData = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
		expect(storedData).not.toBeNull();
	});

	test('should infer cloud mode from pending cache in standalone mode and show sign-in modal', async ({
		page
	}) => {
		await mockStandaloneMode(page);

		await page.goto('/');
		await page.evaluate(
			({ storageKey, modeKey, pendingKey, data, userId }) => {
				localStorage.removeItem(modeKey);
				localStorage.setItem(storageKey, data);
				localStorage.setItem(pendingKey, userId);
			},
			{
				storageKey: STORAGE_KEY,
				modeKey: STORAGE_MODE_KEY,
				pendingKey: CLOUD_PENDING_USER_KEY,
				data: emptyData,
				userId: 'installed-user-123'
			}
		);
		await page.reload();

		// Cloud mode should be inferred and sign-in modal shown
		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
	});

	test('should clear pending cache when discarding pending changes in standalone mode', async ({
		page
	}) => {
		await mockStandaloneMode(page);

		await page.goto('/');
		await page.evaluate(
			({ storageKey, modeKey, pendingKey, data, userId }) => {
				localStorage.removeItem(modeKey);
				localStorage.setItem(storageKey, data);
				localStorage.setItem(pendingKey, userId);
			},
			{
				storageKey: STORAGE_KEY,
				modeKey: STORAGE_MODE_KEY,
				pendingKey: CLOUD_PENDING_USER_KEY,
				data: emptyData,
				userId: 'installed-user-123'
			}
		);
		await page.reload();

		// Dismiss the sign-in modal (discards pending changes)
		await page.getByRole('button', { name: 'Close', exact: true }).click();

		const keys = await page.evaluate(
			({ storageKey, modeKey, pendingKey }) => ({
				storedData: localStorage.getItem(storageKey),
				storedMode: localStorage.getItem(modeKey),
				pendingUser: localStorage.getItem(pendingKey)
			}),
			{
				storageKey: STORAGE_KEY,
				modeKey: STORAGE_MODE_KEY,
				pendingKey: CLOUD_PENDING_USER_KEY
			}
		);

		expect(keys.pendingUser).toBeNull();
		expect(keys.storedData).toBeNull();
		expect(keys.storedMode).toBeNull();
	});
});
