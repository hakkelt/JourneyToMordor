import { expect, test, type Page } from '@playwright/test';
import {
	CLOUD_MODE_DESC_BROWSER,
	CLOUD_MODE_DESC_INSTALLED
} from '../src/lib/storage.descriptions';

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

async function clearStorage(page: Page) {
	await page.evaluate(() => localStorage.clear());
}

async function mockServiceWorkerRegistration(page: Page) {
	await page.addInitScript(() => {
		(window as Window & { __swRegisterUrl?: string }).__swRegisterUrl = undefined;

		if (!('serviceWorker' in navigator)) {
			return;
		}

		const serviceWorkerContainer = navigator.serviceWorker as ServiceWorkerContainer & {
			register: (scriptURL: string | URL, options?: RegistrationOptions) => Promise<unknown>;
		};

		serviceWorkerContainer.register = (scriptURL: string | URL) => {
			(window as Window & { __swRegisterUrl?: string }).__swRegisterUrl = String(scriptURL);
			return Promise.resolve({} as ServiceWorkerRegistration);
		};
	});
}

async function mockWarmImageLoadingProbe(page: Page) {
	await page.addInitScript(() => {
		const win = window as Window & { __warmImageFetchCount?: number };
		win.__warmImageFetchCount = 0;

		Object.defineProperty(window, 'requestIdleCallback', {
			writable: true,
			configurable: true,
			value: (
				callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void
			) => {
				callback({ didTimeout: false, timeRemaining: () => 50 });
				return 1;
			}
		});

		const originalFetch = window.fetch.bind(window);
		window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
			const requestPriority = (init as (RequestInit & { priority?: string }) | undefined)?.priority;
			if (requestPriority === 'low') {
				win.__warmImageFetchCount = (win.__warmImageFetchCount ?? 0) + 1;
			}

			return originalFetch(input, init);
		};
	});
}

test.describe('Installed PWA – UI descriptions', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await clearStorage(page);
		await page.reload();
	});

	test('should show installed-specific cloud mode description on welcome page', async ({
		page
	}) => {
		await mockStandaloneMode(page);
		await page.goto('/');
		await clearStorage(page);
		await page.reload();

		await expect(page.getByText(CLOUD_MODE_DESC_INSTALLED, { exact: false })).toBeVisible();
		await expect(page.getByText(CLOUD_MODE_DESC_BROWSER, { exact: false })).not.toBeVisible();
	});

	test('should show standard cloud mode description on welcome page when not installed', async ({
		page
	}) => {
		// No mockStandaloneMode – default Playwright browser is not standalone
		await expect(page.getByText(CLOUD_MODE_DESC_BROWSER, { exact: false })).toBeVisible();
		await expect(page.getByText(CLOUD_MODE_DESC_INSTALLED, { exact: false })).not.toBeVisible();
	});

	test('should show installed-specific cloud mode description on My Data page', async ({
		page
	}) => {
		await mockStandaloneMode(page);
		await page.goto('/');
		await clearStorage(page);
		await page.reload();

		await page.getByRole('button', { name: 'Choose local mode' }).click();
		await page.getByRole('link', { name: 'My Data' }).first().click();

		await expect(page.getByText(CLOUD_MODE_DESC_INSTALLED, { exact: false })).toBeVisible();
		await expect(page.getByText(CLOUD_MODE_DESC_BROWSER, { exact: false })).not.toBeVisible();
	});

	test('should show standard cloud mode description on My Data page when not installed', async ({
		page
	}) => {
		// No mockStandaloneMode – default Playwright browser is not standalone
		await page.getByRole('button', { name: 'Choose local mode' }).click();
		await page.getByRole('link', { name: 'My Data' }).first().click();

		await expect(page.getByText(CLOUD_MODE_DESC_BROWSER, { exact: false })).toBeVisible();
		await expect(page.getByText(CLOUD_MODE_DESC_INSTALLED, { exact: false })).not.toBeVisible();
	});

	test('should not render install prompt heading in standalone mode', async ({ page }) => {
		await mockStandaloneMode(page);
		await page.goto('/');
		await clearStorage(page);
		await page.reload();

		await expect(page.getByRole('heading', { name: /Install App/ })).not.toBeVisible();
	});

	test('should render install prompt heading in browser (non-standalone) mode', async ({
		page
	}) => {
		// No mockStandaloneMode – install prompt is rendered in browser mode
		await expect(page.getByRole('heading', { name: /Install App/ })).toBeVisible();
	});

	test('should register service worker with installed=1 in standalone mode', async ({ page }) => {
		await mockStandaloneMode(page);
		await mockServiceWorkerRegistration(page);
		await page.goto('/');

		await page.waitForFunction(() => {
			const swUrl = (window as Window & { __swRegisterUrl?: string }).__swRegisterUrl;
			return Boolean(swUrl);
		});

		const swUrl = await page.evaluate(
			() => (window as Window & { __swRegisterUrl?: string }).__swRegisterUrl
		);
		expect(swUrl).toContain('installed=1');
	});

	test('should not register service worker in browser mode', async ({ page }) => {
		await mockServiceWorkerRegistration(page);
		await page.goto('/');
		const swUrl = await page.evaluate(
			() => (window as Window & { __swRegisterUrl?: string }).__swRegisterUrl
		);
		expect(swUrl).toBeUndefined();
	});

	test('should warm-load milestone images in standalone mode', async ({ page }) => {
		await mockStandaloneMode(page);
		await mockWarmImageLoadingProbe(page);
		await page.goto('/');

		await page.waitForFunction(() => {
			const warmFetchCount = (window as Window & { __warmImageFetchCount?: number })
				.__warmImageFetchCount;
			return (warmFetchCount ?? 0) > 0;
		});

		const warmFetchCount = await page.evaluate(
			() => (window as Window & { __warmImageFetchCount?: number }).__warmImageFetchCount ?? 0
		);
		expect(warmFetchCount).toBeGreaterThan(0);
	});

	test('should not warm-load milestone images in browser mode', async ({ page }) => {
		await mockWarmImageLoadingProbe(page);
		await page.goto('/');
		await page.waitForTimeout(600);

		const warmFetchCount = await page.evaluate(
			() => (window as Window & { __warmImageFetchCount?: number }).__warmImageFetchCount ?? 0
		);
		expect(warmFetchCount).toBe(0);
	});

	test('should immediately start SW and warm image cache when appinstalled fires', async ({
		page
	}) => {
		await mockServiceWorkerRegistration(page);
		await mockWarmImageLoadingProbe(page);
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'Welcome, Ringbearer' })).toBeVisible();

		await page.evaluate(() => {
			window.dispatchEvent(new Event('appinstalled'));
		});

		await page.waitForFunction(() => {
			const swUrl = (window as Window & { __swRegisterUrl?: string }).__swRegisterUrl;
			return Boolean(swUrl);
		});

		const swUrl = await page.evaluate(
			() => (window as Window & { __swRegisterUrl?: string }).__swRegisterUrl
		);
		expect(swUrl).toContain('installed=1');

		await page.waitForFunction(() => {
			const warmFetchCount = (window as Window & { __warmImageFetchCount?: number })
				.__warmImageFetchCount;
			return (warmFetchCount ?? 0) > 0;
		});

		const warmFetchCount = await page.evaluate(
			() => (window as Window & { __warmImageFetchCount?: number }).__warmImageFetchCount ?? 0
		);
		expect(warmFetchCount).toBeGreaterThan(0);

		const cachedImageCount = await page.evaluate(async () => {
			const imageCache = await caches.open('images');
			const requests = await imageCache.keys();
			return requests.length;
		});
		expect(cachedImageCount).toBeGreaterThan(0);
	});

	test('should render credits images offline across multiple screen sizes after warm cache', async ({
		page
	}) => {
		await mockStandaloneMode(page);
		await page.addInitScript(() => {
			Object.defineProperty(window, 'requestIdleCallback', {
				writable: true,
				configurable: true,
				value: (
					callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void
				) => {
					callback({ didTimeout: false, timeRemaining: () => 50 });
					return 1;
				}
			});
		});

		const viewports = [
			{ width: 390, height: 844 },
			{ width: 768, height: 1024 },
			{ width: 1366, height: 900 }
		];
		const expectedImageUrls = new Set<string>();

		await page.goto('/');
		await page.getByRole('button', { name: 'Choose local mode' }).click();

		for (const viewport of viewports) {
			await page.setViewportSize(viewport);
			await page.goto('/credits');
			await expect(page.getByRole('heading', { name: 'Credits' })).toBeVisible();

			await page.waitForFunction(() => {
				const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
				return images.length > 0 && images.every((img) => img.complete && img.naturalWidth > 0);
			});

			const viewportUrls = await page.evaluate(() => {
				const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
				const sameOriginUrls = images
					.map((img) => img.currentSrc || img.src)
					.filter((url) => url.startsWith(window.location.origin));
				return [...new Set(sameOriginUrls)];
			});

			for (const url of viewportUrls) {
				expectedImageUrls.add(url);
			}
		}

		await page.waitForFunction(
			async (urls) => {
				const imageCache = await caches.open('images');
				for (const url of urls) {
					const match = await imageCache.match(url);
					if (!match) return false;
				}
				return true;
			},
			[...expectedImageUrls]
		);

		await page.context().setOffline(true);

		for (const viewport of viewports) {
			await page.setViewportSize(viewport);
			await expect(page.getByRole('heading', { name: 'Credits' })).toBeVisible();

			const offlineImageStats = await page.evaluate(async () => {
				const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
				const targetUrls = images.map((img) => img.currentSrc || img.src);

				const loadedStates = await Promise.all(
					targetUrls.map(
						(url) =>
							new Promise<boolean>((resolve) => {
								const probe = new Image();
								probe.onload = () => resolve(true);
								probe.onerror = () => resolve(false);
								probe.src = url;
							})
					)
				);

				const loaded = loadedStates.filter(Boolean).length;
				return { total: loadedStates.length, loaded };
			});

			expect(offlineImageStats.total).toBeGreaterThan(0);
			expect(offlineImageStats.loaded).toBe(offlineImageStats.total);
		}
	});
});

test.describe('Installed PWA – localStorage persistence', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await clearStorage(page);
		await page.reload();
	});

	test('should preserve pending cloud cache across reload when in standalone mode', async ({
		page
	}) => {
		await mockStandaloneMode(page);
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

	test('should infer cloud mode from pending cache and show sign-in modal', async ({ page }) => {
		await mockStandaloneMode(page);
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

	test('should clear pending cache when discarding pending changes', async ({ page }) => {
		await mockStandaloneMode(page);
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
