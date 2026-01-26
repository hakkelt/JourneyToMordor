<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import Header from '$lib/components/Header.svelte';
	import { loadData } from '$lib/storage';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	let { children } = $props();

	onMount(() => {
		loadData();
	});
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
		<p>&copy; 2026 Tamás Hakkel. Not affiliated with Tolkien Estate.</p>
		<p class="mt-2 space-x-4">
			<a href={resolve('/my-data')} class="text-ring-400 hover:text-ring-300 hover:underline"
				>My Data</a
			>
			<span class="text-slate-600">|</span>
			<a href={resolve('/privacy')} class="text-ring-400 hover:text-ring-300 hover:underline"
				>Privacy Policy</a
			>
		</p>
	</footer>
</div>
