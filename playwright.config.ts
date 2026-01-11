import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { 
        command: 'bun run build && bun run preview -- --host', 
        port: 4173,
        reuseExistingServer: true
    },
    use: {
        baseURL: 'http://localhost:4173',
    },
	testDir: 'e2e'
});
