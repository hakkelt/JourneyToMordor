<script lang="ts">
	import './layout.css';
	import Header from '$lib/components/Header.svelte';
	import { loadData } from '$lib/storage';
	import { isOnline } from '$lib/stores/network';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { warmImageCache } from '$lib/image-cache';
	import favicon from '$lib/assets/favicon-32.png';

	interface BeforeInstallPromptEvent extends Event {
		prompt: () => void;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
	}

	let { children } = $props();
	let installPrompt = $state<BeforeInstallPromptEvent | null>(null);

	onMount(() => {
		const handler = (e: Event) => {
			e.preventDefault();
			installPrompt = e as BeforeInstallPromptEvent;
		};
		window.addEventListener('beforeinstallprompt', handler);

		loadData();
		warmImageCache();

		return () => window.removeEventListener('beforeinstallprompt', handler);
	});

	async function installApp() {
		if (!installPrompt) return;
		installPrompt.prompt();
		const { outcome } = await installPrompt.userChoice;
		if (outcome === 'accepted') {
			installPrompt = null;
		}
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col bg-earth-50">
	<Header />

	<main class="flex-grow p-4 md:p-6">
		<div class="mx-auto max-w-4xl">
			{@render children()}
		</div>
	</main>

	<footer class="bg-earth-900 py-6 text-center text-sm text-slate-400">
		<div class="flex items-center justify-center gap-4">
			<p>&copy; 2026 Tamás Hakkel. Not affiliated with Tolkien Estate.</p>
			<a
				href="https://github.com/hakkelt/JourneyToMordor"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center text-ring-400 transition-colors hover:text-ring-300"
				class:opacity-50={!$isOnline}
				class:pointer-events-none={!$isOnline}
				aria-label="GitHub Repository"
			>
				<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill-rule="evenodd"
						d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
						clip-rule="evenodd"
					/>
				</svg>
			</a>
		</div>
		<p class="mt-2 space-x-4">
			{#if installPrompt}
				<button
					onclick={installApp}
					class="text-ring-400 hover:text-ring-300 hover:underline disabled:pointer-events-none disabled:opacity-50"
					disabled={!$isOnline}
				>
					Install App
				</button>
				<span class="text-slate-600">|</span>
			{/if}
			<a href={resolve('/privacy')} class="text-ring-400 hover:text-ring-300 hover:underline"
				>Privacy Policy</a
			>
			<span class="text-slate-600">|</span>
			<a href={resolve('/credits')} class="text-ring-400 hover:text-ring-300 hover:underline"
				>Credits</a
			>
			<span class="text-slate-600">|</span>
			<a
				href="https://github.com/hakkelt/JourneyToMordor/discussions"
				target="_blank"
				rel="noopener noreferrer"
				class="text-ring-400 hover:text-ring-300 hover:underline"
				class:opacity-50={!$isOnline}
				class:pointer-events-none={!$isOnline}>Discussions</a
			>
			<span class="text-slate-600">|</span>
			<a
				href="https://github.com/hakkelt/JourneyToMordor/issues"
				target="_blank"
				rel="noopener noreferrer"
				class="text-ring-400 hover:text-ring-300 hover:underline"
				class:opacity-50={!$isOnline}
				class:pointer-events-none={!$isOnline}>Bug Reports</a
			>
		</p>
	</footer>
</div>
