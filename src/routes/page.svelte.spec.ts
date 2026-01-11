import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render welcome message', async () => {
		render(Page);

		const heading = page.getByRole('heading', { name: 'Welcome, Ringbearer' });
		await expect.element(heading).toBeInTheDocument();
	});
});
