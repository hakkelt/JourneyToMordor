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
			injectRegister: 'script',
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
				],
				screenshots: [
					{
						src: 'screenshot-wide.png',
						sizes: '1280x720',
						type: 'image/png',
						form_factor: 'wide',
						label: 'Journey to Mordor Dashboard - Desktop'
					},
					{
						src: 'screenshot-mobile.png',
						sizes: '390x844',
						type: 'image/png',
						form_factor: 'narrow',
						label: 'Journey to Mordor Dashboard - Mobile'
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
	cacheDir: 'node_modules/.vite'
});
