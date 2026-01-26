<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';
	import Auth from '$lib/components/Auth.svelte';
	import { page } from '$app/stores';
	import { journeyStore, setUnit, loadData } from '$lib/storage';
	import { user } from '$lib/stores/auth';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	let { children } = $props();

	onMount(() => {
		loadData();
	});

	function handleSetUnit(unit: 'km' | 'miles') {
		setUnit(unit, $user);
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col bg-slate-100">
	<header class="sticky top-0 z-50 bg-slate-800 text-white shadow-lg">
		<div
			class="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between"
		>
			<div class="flex items-center justify-between">
				<a
					href={resolve('/')}
					class="font-serif text-2xl font-bold tracking-wider text-pumpkin-400"
				>
					Journey To Mordor
				</a>
			</div>

			<div class="flex flex-col gap-4 md:flex-row md:items-center">
				<!-- Navigation -->
				<nav class="flex space-x-1 rounded-lg bg-slate-700 p-1">
					<a
						href={resolve('/')}
						class="rounded px-3 py-1.5 text-sm font-medium transition-colors {$page.url.pathname ===
						resolve('/')
							? 'bg-slate-600 text-white shadow-sm'
							: 'text-slate-300 hover:text-white'}"
					>
						Dashboard
					</a>
					<a
						href={resolve('/logs')}
						class="rounded px-3 py-1.5 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
							resolve('/logs')
						)
							? 'bg-slate-600 text-white shadow-sm'
							: 'text-slate-300 hover:text-white'}"
					>
						Logs
					</a>
					<a
						href={resolve('/my-data')}
						class="rounded px-3 py-1.5 text-sm font-medium transition-colors {$page.url.pathname.startsWith(
							resolve('/my-data')
						)
							? 'bg-slate-600 text-white shadow-sm'
							: 'text-slate-300 hover:text-white'}"
					>
						My Data
					</a>
				</nav>

				<div class="flex items-center gap-4">
					<!-- Unit Selector -->
					<div class="flex rounded-md bg-slate-700 p-1">
						<button
							class="rounded px-2 py-1 text-xs font-medium transition-colors {$journeyStore.unit ===
							'km'
								? 'bg-slate-600 text-white shadow-sm'
								: 'text-slate-400 hover:text-white'}"
							onclick={() => handleSetUnit('km')}
						>
							km
						</button>
						<button
							class="rounded px-2 py-1 text-xs font-medium transition-colors {$journeyStore.unit ===
							'miles'
								? 'bg-slate-600 text-white shadow-sm'
								: 'text-slate-400 hover:text-white'}"
							onclick={() => handleSetUnit('miles')}
						>
							mi
						</button>
					</div>

					<Auth />
				</div>
			</div>
		</div>
	</header>

	<main class="flex-grow p-4 md:p-6">
		<div class="mx-auto max-w-4xl">
			{@render children()}
		</div>
	</main>

	<footer class="bg-slate-800 py-6 text-center text-sm text-slate-400">
		<p>&copy; 2026 Tamás Hakkel. Not affiliated with Tolkien Estate.</p>
		<p class="mt-2 space-x-4">
			<a href={resolve('/my-data')} class="text-pumpkin-400 hover:text-pumpkin-300 hover:underline"
				>My Data</a
			>
			<span class="text-slate-600">|</span>
			<a href={resolve('/privacy')} class="text-pumpkin-400 hover:text-pumpkin-300 hover:underline"
				>Privacy Policy</a
			>
		</p>
	</footer>
</div>
