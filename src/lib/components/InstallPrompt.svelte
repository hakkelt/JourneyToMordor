<script lang="ts">
	import { onMount } from 'svelte';

	let deferredPrompt: BeforeInstallPromptEvent | null = $state(null);

	onMount(() => {
		const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
			// Prevent Chrome 67 and earlier from automatically showing the prompt
			e.preventDefault();
			// Stash the event so it can be triggered later.
			deferredPrompt = e;
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		};
	});

	async function handleInstall() {
		if (!deferredPrompt) return;

		// Show the install prompt
		deferredPrompt.prompt();
		// Wait for the user to respond to the prompt
		const { outcome } = await deferredPrompt.userChoice;
		// We've used the prompt, and can't use it again, throw it away
		if (outcome === 'accepted') {
			deferredPrompt = null;
		}
	}
</script>

{#if deferredPrompt}
	<div class="rounded-lg border-l-4 border-sky-500 bg-white p-4 transition-all hover:shadow-md">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="font-semibold text-sky-900">📲 Install App</p>
				<p class="mt-1 text-sm text-sky-800">
					Add to your home screen for the best experience. Works offline!
				</p>
			</div>
			<button
				onclick={handleInstall}
				class="shrink-0 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none"
			>
				Install Now
			</button>
		</div>
	</div>
{/if}
