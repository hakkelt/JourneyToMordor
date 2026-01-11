<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col bg-slate-100">
	<header class="sticky top-0 z-50 bg-slate-800 text-white shadow-lg">
		<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
			<h1 class="font-serif text-2xl font-bold tracking-wider text-pumpkin-400">
				Journey To Mordor
			</h1>
		</div>
	</header>

	<main class="flex-grow p-4 md:p-6">
		<div class="mx-auto max-w-4xl">
			{@render children()}
		</div>
	</main>

	<footer class="bg-slate-800 py-6 text-center text-sm text-slate-400">
		<p>&copy; 2026 Tamás Hakkel. Not affiliated with Tolkien Estate.</p>
	</footer>
</div>
