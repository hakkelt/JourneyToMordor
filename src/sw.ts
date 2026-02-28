/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: Array<string | { url: string; revision?: string | null }>;
};

const shouldPrecache = new URL(self.location.href).searchParams.get('installed') === '1';

self.skipWaiting();
clientsClaim();

if (shouldPrecache) {
	precacheAndRoute(self.__WB_MANIFEST);
	cleanupOutdatedCaches();
} else {
	self.addEventListener('activate', (event) => {
		event.waitUntil(
			(async () => {
				const keys = await caches.keys();
				const precacheKeys = keys.filter((key) => key.includes('precache'));
				await Promise.all(precacheKeys.map((key) => caches.delete(key)));
			})()
		);
	});
}

registerRoute(
	/\.(?:png|jpg|jpeg|webp|avif|gif)$/i,
	new CacheFirst({
		cacheName: 'images',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 30 * 24 * 60 * 60
			})
		]
	})
);

registerRoute(
	/^https:\/\/fonts\.googleapis\.com\/.*/i,
	new CacheFirst({
		cacheName: 'google-fonts-cache',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 10,
				maxAgeSeconds: 60 * 60 * 24 * 365
			}),
			new CacheableResponsePlugin({
				statuses: [0, 200]
			})
		]
	})
);

registerRoute(
	/^https:\/\/fonts\.gstatic\.com\/.*/i,
	new CacheFirst({
		cacheName: 'gstatic-fonts-cache',
		plugins: [
			new ExpirationPlugin({
				maxEntries: 10,
				maxAgeSeconds: 60 * 60 * 24 * 365
			}),
			new CacheableResponsePlugin({
				statuses: [0, 200]
			})
		]
	})
);
