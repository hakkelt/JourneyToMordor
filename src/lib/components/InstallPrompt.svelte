<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { installPromptEvent } from '$lib/stores/installPrompt';

	let isStandalone = $state(false);

	onMount(() => {
		if (browser) {
			isStandalone =
				window.matchMedia('(display-mode: standalone)').matches ||
				window.matchMedia('(display-mode: fullscreen)').matches ||
				(window.navigator as Navigator & { standalone?: boolean }).standalone === true;
		}
	});

	async function handleInstall() {
		if (!$installPromptEvent) return;

		// Show the install prompt
		await $installPromptEvent.prompt();
		// Wait for the user to respond to the prompt
		await $installPromptEvent.userChoice;
		// We've used the prompt, and can't use it again, throw it away
		installPromptEvent.set(null);
	}
</script>

{#if !isStandalone}
	<div
		class="space-y-4 rounded-xl border border-slate-200 bg-gradient-to-br from-earth-50 to-slate-50 p-6 text-left shadow-sm dark:border-slate-600 dark:from-slate-600 dark:to-slate-600"
	>
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h3 class="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
					📲 Install App
				</h3>
				<p class="mt-1 text-base text-slate-700 dark:text-slate-300">
					Add to your home screen for the best experience. Works offline!
				</p>
			</div>
			<button
				onclick={handleInstall}
				disabled={!$installPromptEvent}
				class="shrink-0 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-sky-600"
			>
				{$installPromptEvent ? 'Install Now' : 'Install via Browser Menu'}
			</button>
		</div>
	</div>
{/if}
