import { expect, test, type Page } from '@playwright/test';

const STORAGE_KEY = 'mordor_tracker_v1';
const STORAGE_MODE_KEY = 'mordor_storage_mode_v1';
const CLOUD_PENDING_USER_KEY = 'mordor_pending_cloud_user_v1';

const emptyData = JSON.stringify({ logs: [], unit: 'km', deletedLogIds: [] });

async function clearStorage(page: Page) {
	await page.evaluate(() => localStorage.clear());
}

async function chooseLocalMode(page: Page) {
	await page.getByRole('button', { name: 'Choose local mode' }).click();
}

test.describe('Storage Modes', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await clearStorage(page);
		await page.reload();
	});

	test('should infer local mode when local data exists without pending cloud user id', async ({
		page
	}) => {
		await page.evaluate(
			({ storageKey, modeKey, pendingKey, data }) => {
				localStorage.removeItem(modeKey);
				localStorage.removeItem(pendingKey);
				localStorage.setItem(storageKey, data);
			},
			{
				storageKey: STORAGE_KEY,
				modeKey: STORAGE_MODE_KEY,
				pendingKey: CLOUD_PENDING_USER_KEY,
				data: emptyData
			}
		);

		await page.reload();

		await expect(page.getByText('Selected mode: local')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign In' })).not.toBeVisible();

		const modeValue = await page.evaluate((key) => localStorage.getItem(key), STORAGE_MODE_KEY);
		expect(modeValue).toBe('local');
	});

	test('should infer cloud mode from pending cloud cache and allow discarding pending changes', async ({
		page
	}) => {
		await page.evaluate(
			({ storageKey, modeKey, pendingKey, data }) => {
				localStorage.removeItem(modeKey);
				localStorage.setItem(storageKey, data);
				localStorage.setItem(pendingKey, 'user-123');
			},
			{
				storageKey: STORAGE_KEY,
				modeKey: STORAGE_MODE_KEY,
				pendingKey: CLOUD_PENDING_USER_KEY,
				data: emptyData
			}
		);

		await page.reload();

		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Logs' }).first()).toHaveClass(/opacity-50/);

		await page.getByRole('button', { name: 'Close', exact: true }).click();

		await expect(page.getByRole('heading', { name: 'Sign In' })).not.toBeVisible();
		await expect(page.getByText(/choose one mode to continue/i)).toBeVisible();

		const keys = await page.evaluate(
			({ storageKey, modeKey, pendingKey }) => {
				return {
					storedData: localStorage.getItem(storageKey),
					storedMode: localStorage.getItem(modeKey),
					pendingUser: localStorage.getItem(pendingKey)
				};
			},
			{
				storageKey: STORAGE_KEY,
				modeKey: STORAGE_MODE_KEY,
				pendingKey: CLOUD_PENDING_USER_KEY
			}
		);

		expect(keys.storedData).toBeNull();
		expect(keys.storedMode).toBeNull();
		expect(keys.pendingUser).toBeNull();
	});

	test('should show local-to-cloud switch confirmation details and keep local mode when canceled', async ({
		page
	}) => {
		await chooseLocalMode(page);
		await page.getByRole('link', { name: 'My Data' }).first().click();

		await page.getByRole('button', { name: 'Cloud mode' }).first().click();

		await expect(page.getByRole('heading', { name: 'Switch to cloud mode?' })).toBeVisible();
		await expect(
			page.getByText('Keep current device data to merge with cloud data after sign-in')
		).toBeVisible();

		await page.getByRole('button', { name: 'Cancel' }).click();

		await expect(page.getByRole('heading', { name: 'Switch to cloud mode?' })).not.toBeVisible();
		await expect(page.getByText(/Current mode:\s*local/i)).toBeVisible();
	});

	test('should switch from local to cloud and require sign-in for protected tabs', async ({
		page
	}) => {
		await chooseLocalMode(page);
		await page.getByRole('link', { name: 'My Data' }).first().click();

		await page.getByRole('button', { name: 'Cloud mode' }).first().click();
		await page.getByRole('button', { name: 'Confirm Switch' }).click();

		await expect(page).toHaveURL(/\/$/);
		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Logs' }).first()).toHaveClass(/opacity-50/);
		await expect(page.getByRole('link', { name: 'My Data' }).first()).toHaveClass(/opacity-50/);

		await page.getByRole('button', { name: 'Close', exact: true }).click();
		await expect(page.getByText(/choose one mode to continue/i)).toBeVisible();
	});

	test('should hide account information and signed-out delete-account helper in local mode', async ({
		page
	}) => {
		await chooseLocalMode(page);
		await page.getByRole('link', { name: 'My Data' }).first().click();

		await expect(page.getByRole('heading', { name: 'Account Information' })).not.toBeVisible();
		await expect(
			page.getByText(
				"You need to be signed in to delete your account. Since you're not signed in, you can only clear your local data."
			)
		).not.toBeVisible();
	});

	test('should keep mode unselected after dismissing cloud sign-in and reloading', async ({
		page
	}) => {
		await chooseLocalMode(page);
		await page.getByRole('link', { name: 'My Data' }).first().click();

		await page.getByRole('button', { name: 'Cloud mode' }).first().click();
		await page.getByRole('button', { name: 'Confirm Switch' }).click();

		await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
		await page.getByRole('button', { name: 'Close', exact: true }).click();
		await expect(page.getByText(/choose one mode to continue/i)).toBeVisible();

		await page.reload();

		await expect(page.getByText(/choose one mode to continue/i)).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Sign In' })).not.toBeVisible();

		const keys = await page.evaluate(
			({ storageKey, modeKey, pendingKey }) => {
				return {
					storedData: localStorage.getItem(storageKey),
					storedMode: localStorage.getItem(modeKey),
					pendingUser: localStorage.getItem(pendingKey)
				};
			},
			{
				storageKey: STORAGE_KEY,
				modeKey: STORAGE_MODE_KEY,
				pendingKey: CLOUD_PENDING_USER_KEY
			}
		);

		expect(keys.storedData).toBeNull();
		expect(keys.storedMode).toBeNull();
		expect(keys.pendingUser).toBeNull();
	});
});
