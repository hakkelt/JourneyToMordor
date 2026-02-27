import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'bun run build && bun run preview -- --host',
		port: 4173,
		reuseExistingServer: false,
		timeout: 600000
	},
	use: {
		baseURL: 'http://localhost:4173'
	},
	testDir: 'e2e'
});
