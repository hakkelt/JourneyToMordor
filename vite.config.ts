import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		enhancedImages(),
		tailwindcss(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			devOptions: {
				enabled: true,
				type: 'module'
			},
			injectRegister: 'inline',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,svg,json}'],
				cleanupOutdatedCaches: true,
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
				runtimeCaching: [
					{
						urlPattern: /\.(?:png|jpg|jpeg|webp|avif|gif)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'images',
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
							}
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				]
			},
			manifest: {
				name: 'Journey to Mordor',
				short_name: 'Journey to Mordor',
				description: 'Track your distance and journey to Mordor with Frodo',
				theme_color: '#1a1a1a',
				background_color: '#1a1a1a',
				display: 'standalone',
				icons: [
					{
						src: 'icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: 'icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			}
		})
	],

	build: {
		// Enable persistent caching for faster rebuilds
		// This caches processed images and other build artifacts
		rollupOptions: {
			cache: true
		}
	},

	// Enable Vite's persistent cache for dependencies and transformations
	cacheDir: 'node_modules/.vite',

	test: {
		expect: { requireAssertions: true },

		projects: [
			{
				extends: './vite.config.ts',

				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
