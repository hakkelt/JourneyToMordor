<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.png';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-slate-100 flex flex-col">
	<header class="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
		<div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
			<h1 class="text-2xl font-serif text-pumpkin-400 font-bold tracking-wider">
				Journey To Mordor
			</h1>
		</div>
	</header>

	<main class="flex-grow p-4 md:p-6">
		<div class="max-w-4xl mx-auto">
			{@render children()}
		</div>
	</main>

	<footer class="bg-slate-800 text-slate-400 py-6 text-center text-sm">
		<p>&copy; 2026 Tamás Hakkel. Not affiliated with Tolkien Estate.</p>
	</footer>
</div>
