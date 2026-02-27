<script lang="ts">
	import { LOCATIONS } from '$lib/data';
	import headerLogo from '$lib/assets/header.png?enhanced';

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
		const imageUrl = typeof loc.image === 'string' ? loc.image : loc.image.img.src;
		let href = imageUrl;

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
			displayText = getDomain(imageUrl);
		}

		return {
			...loc,
			displayText,
			originalUrl: href
		};
	});
</script>

<svelte:head>
	<title>Credits | Journey to Mordor</title>
</svelte:head>

<div class="space-y-12 pb-12">
	<header class="text-center">
		<h1 class="font-serif text-4xl text-slate-800 md:text-5xl dark:text-slate-100">Credits</h1>
		<p class="mt-4 text-lg text-slate-600 dark:text-slate-300">
			This project is a tribute to J.R.R. Tolkien's masterpiece. We attribute all sources of data
			and imagery used to bring this journey to life.
		</p>
	</header>

	<section class="space-y-6">
		<div class="border-b border-slate-200 pb-2 dark:border-slate-600">
			<h2 class="font-serif text-2xl font-bold text-slate-800 italic dark:text-slate-100">
				Data & Journey Sources
			</h2>
		</div>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div
				class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-700"
			>
				<h3 class="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
					The Eowyn Challenge
				</h3>
				<p class="mt-2 text-slate-600 dark:text-slate-300">
					The primary inspiration and source for the daily distances and milestone tracking of
					Frodo's journey from Bag End to Mount Doom.
				</p>
				<a
					href="https://under1000skies.org/eowyn/"
					target="_blank"
					rel="noopener noreferrer"
					class="mt-4 inline-block font-medium text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
				>
					https://under1000skies.org/eowyn/
				</a>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-700"
			>
				<h3 class="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
					The Atlas of Middle-earth
				</h3>
				<p class="mt-2 text-slate-600 dark:text-slate-300">
					By Karen Wynn Fonstad. The definitive geographical guide to Middle-earth, providing the
					foundational measurements and mapping used for calculating distances.
				</p>
				<a
					href="https://en.wikipedia.org/wiki/The_Atlas_of_Middle-earth"
					target="_blank"
					rel="noopener noreferrer"
					class="mt-4 inline-block font-medium text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
				>
					Wikipedia Reference
				</a>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-700"
			>
				<h3 class="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
					Community Journey Trackers
				</h3>
				<p class="mt-2 text-slate-600 dark:text-slate-300">
					Various community-maintained Google Sheets that provide detailed day-by-day breakdowns of
					the journey.
				</p>
				<div class="mt-4 flex flex-col space-y-2">
					<span>
						<a
							href="https://docs.google.com/spreadsheets/d/1XxPtIuZ77z4tYFLbTAkg9yXxvPgTjFZdBoruv5ptBwI/copy?usp=sharing"
							target="_blank"
							rel="noopener noreferrer"
							class="font-medium text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
						>
							Walk to Mordor Tracker
						</a>
						(
						<a
							href="https://www.reddit.com/r/lotr/comments/1ly40nj/free_walk_to_mordor_tracker_google_sheets/"
							target="_blank"
							rel="noopener noreferrer"
							class="font-medium text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
						>
							Reddit Announcement
						</a>)</span
					>
					<a
						href="https://docs.google.com/spreadsheets/d/1pXWU9XhDPpOtT5Ed8roqRFAfQ1pFm76zcSlxnCNAuK4/edit?gid=0#gid=0"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
					>
						Mordor Walk Challenge - 2025
					</a>
					<a
						href="https://docs.google.com/spreadsheets/d/1wl-ae9nFdPMyQ8uMbpwIYGbXEJirOq4P3EDHiy94iXc/edit?gid=0#gid=0"
						target="_blank"
						rel="noopener noreferrer"
						class="font-medium text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
					>
						Walking to Mordor and Back — The Nerd Fitness 'Walking to Mordor' Challenge
					</a>
				</div>
			</div>

			<div
				class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-600 dark:bg-slate-700"
			>
				<h3 class="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
					Tolkien Gateway
				</h3>
				<p class="mt-2 text-slate-600 dark:text-slate-300">
					The ultimate collaborative encyclopedia for everything Tolkien, used for verifying quotes,
					dates, and historical details.
				</p>
				<a
					href="https://tolkiengateway.net/"
					target="_blank"
					rel="noopener noreferrer"
					class="mt-4 inline-block font-medium text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
				>
					tolkiengateway.net
				</a>
			</div>
		</div>
	</section>

	<section class="space-y-6">
		<div class="border-b border-slate-200 pb-2 dark:border-slate-600">
			<h2 class="font-serif text-2xl font-bold text-slate-800 italic dark:text-slate-100">
				Image Attribution
			</h2>
		</div>
		<p class="text-slate-600 dark:text-slate-300">
			All images used in this challenge are property of their respective creators.
		</p>
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<div
				class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-700"
			>
				<div class="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-600">
					<enhanced:img
						src={headerLogo}
						alt="Header Logo & Favicon"
						class="h-full w-full object-cover"
					/>
				</div>
				<div class="p-4">
					<h3 class="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
						Header Logo & Favicon
					</h3>
					<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Source:</p>
					<a
						href="https://commons.wikimedia.org/wiki/File:Unico_Anello.png"
						target="_blank"
						rel="noopener noreferrer external"
						class="mt-1 block truncate text-sm font-medium text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
					>
						Wikimedia Commons — File:Unico_Anello.png (Xander)
					</a>
				</div>
			</div>

			{#each combinedCredits as loc (`${loc.id}-${loc.name}`)}
				<div
					class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-700"
				>
					<div class="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-600">
						<enhanced:img src={loc.image} alt={loc.name} class="h-full w-full object-cover" />
					</div>
					<div class="p-4">
						<h3 class="font-serif text-xl font-bold text-slate-800 dark:text-slate-100">
							{loc.name}
						</h3>
						<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Source:</p>
						<a
							href={loc.originalUrl}
							target="_blank"
							rel="noopener noreferrer external"
							class="mt-1 block truncate text-sm font-medium text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
						>
							{loc.displayText}
						</a>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<footer class="pt-8 text-center text-slate-500 dark:text-slate-400">
		<p>
			If you are the owner of any content displayed here and wish for it to be removed or attributed
			differently, please contact us.
		</p>
	</footer>
</div>
