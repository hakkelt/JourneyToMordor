<script lang="ts">
	import { LOCATIONS } from '$lib/data';

	function getDomain(url: string) {
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return url;
		}
	}

	// Map locations to a simplified credit object for display
	const combinedCredits = LOCATIONS.map((loc) => {
		let displayText = '';
		let href = loc.image;

		if (loc.credit) {
			href = loc.credit.url;
			if (loc.credit.type === 'film') {
				displayText = `The Lord of the Rings: ${loc.credit.movie}`;
			} else if (loc.credit.type === 'artist') {
				displayText = loc.credit.title
					? `${loc.credit.artist} — ${loc.credit.title}`
					: loc.credit.artist || '';
			} else if (loc.credit.type === 'game') {
				displayText = loc.credit.game || getDomain(loc.credit.url);
			} else {
				displayText = getDomain(loc.credit.url);
			}
		} else {
			displayText = getDomain(loc.image);
		}

		return {
			...loc,
			displayText,
			originalUrl: href
		};
	});
</script>

<svelte:head>
	<title>Image Credits | Journey to Mordor</title>
</svelte:head>

<div class="space-y-8">
	<header class="text-center">
		<h1 class="font-serif text-4xl text-slate-800 md:text-5xl">Image Credits</h1>
		<p class="mt-4 text-lg text-slate-600">
			All images used in this challenge are property of their respective creators.
		</p>
	</header>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		{#each combinedCredits as loc}
			<div
				class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
			>
				<div class="aspect-video w-full overflow-hidden bg-slate-100">
					<img src={loc.image} alt={loc.name} class="h-full w-full object-cover" />
				</div>
				<div class="p-4">
					<h3 class="font-serif text-xl font-bold text-slate-800">{loc.name}</h3>
					<p class="mt-1 text-sm text-slate-500">Source:</p>
					<a
						href={loc.originalUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-1 block truncate text-sm font-medium text-ring-600 hover:underline"
					>
						{loc.displayText}
					</a>
				</div>
			</div>
		{/each}
	</div>

	<footer class="pt-8 text-center text-slate-500">
		<p>
			If you are the owner of any of these images and wish for them to be removed or attributed
			differently, please contact us.
		</p>
	</footer>
</div>
