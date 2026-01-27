<script lang="ts">
	import type { LogEntry } from '$lib/storage';
	import { LOCATIONS } from '$lib/data';
	import ProgressChart from './ProgressChart.svelte';
	import InstallPrompt from './InstallPrompt.svelte';
	import { resolve } from '$app/paths';

	interface Props {
		logs: LogEntry[];
		unit?: 'km' | 'miles';
	}
	let { logs, unit = 'km' }: Props = $props();

	// Derived state
	let totalDistance = $derived(logs.reduce((sum, log) => sum + log.distance, 0));

	// Display helpers
	const KM_TO_MILES = 0.621371;
	function formatDist(km: number): string {
		if (unit === 'miles') return (km * KM_TO_MILES).toFixed(1);
		return km.toFixed(1);
	}
	let unitLabel = $derived(unit === 'miles' ? 'miles' : 'km');

	// reverse findIndex returns index from the end. We need index from start.
	// Actually easier:
	let reachedMilestones = $derived(LOCATIONS.filter((m) => totalDistance >= m.distance));
	let currentLocation = $derived(reachedMilestones[reachedMilestones.length - 1] || LOCATIONS[0]);

	let nextMilestone = $derived(
		LOCATIONS.find((m) => m.distance > totalDistance) || LOCATIONS[LOCATIONS.length - 1]
	);

	let isFinished = $derived(totalDistance >= LOCATIONS[LOCATIONS.length - 1].distance);

	let distanceRemaining = $derived(
		isFinished ? 0 : Math.max(0, nextMilestone.distance - totalDistance)
	);

	let progressPercent = $derived(
		Math.min(100, (totalDistance / LOCATIONS[LOCATIONS.length - 1].distance) * 100)
	);
	// Background image
	let bgImage = $derived(currentLocation.image);
</script>

<div class="space-y-6">
	<!-- Status Header -->
	<div class="relative flex h-64 items-end overflow-hidden rounded-lg shadow-md">
		<enhanced:img
			src={bgImage}
			alt={currentLocation.name}
			class="absolute inset-0 h-full w-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-earth-900 to-transparent opacity-90"></div>

		<div class="relative z-10 w-full p-6 text-white">
			<div class="mb-1 text-sm font-bold tracking-wider text-ring-400 uppercase">
				Current Location
			</div>
			<h2 class="mb-2 font-display text-4xl font-normal md:text-5xl">{currentLocation.name}</h2>
			<p class="text-sm italic opacity-80">"{currentLocation.quote}"</p>
		</div>
	</div>

	<!-- Stats Grid -->
	{#if logs.length > 0}
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-lg border-l-4 border-ring-500 bg-white p-4 shadow-sm">
				<div class="mb-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
					Total Distance
				</div>
				<div class="text-2xl font-bold text-slate-800">
					{formatDist(totalDistance)}
					<span class="text-sm font-normal text-slate-500">{unitLabel}</span>
				</div>
			</div>

			<div class="rounded-lg border-l-4 border-shire-500 bg-white p-4 shadow-sm">
				<div class="mb-1 text-xs font-bold tracking-wide text-slate-500 uppercase">Next Stop</div>
				<div class="truncate text-2xl font-bold text-slate-800" title={nextMilestone.name}>
					{nextMilestone.name}
				</div>
			</div>

			<div class="rounded-lg border-l-4 border-earth-500 bg-white p-4 shadow-sm">
				<div class="mb-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
					Remaining until next stop
				</div>
				<div class="text-2xl font-bold text-slate-800">
					{isFinished ? 'Done!' : `${formatDist(distanceRemaining)} ${unitLabel}`}
				</div>
			</div>
		</div>
	{/if}

	{#if logs.length === 0}
		<div class="rounded-lg border-t-4 border-ring-500 bg-white p-8 text-center shadow-md">
			<h2 class="mb-4 font-serif text-4xl text-slate-800 md:text-5xl">Welcome, Ringbearer</h2>

			<div class="mb-8 space-y-4 text-left text-lg text-slate-600">
				<p>
					The <strong>Walking to Mordor</strong> challenge is the ultimate virtual fitness journey
					for Middle-earth fans. Based on the epic quest of Frodo and Sam in
					<em>The Lord of the Rings</em>, this challenge tasks you with covering the entire distance
					from their doorstep in Bag End to the fiery chasm of Mount Doom.
				</p>
				<p class="py-2 text-center text-xl font-bold text-slate-800">
					Total Distance: ~1,784 miles (2,871 km)
				</p>
				<p>
					While Frodo's journey took roughly <strong>six months (185 days)</strong>—from leaving the
					Shire on September 23rd to the destruction of the Ring on March 25th—you can complete this
					challenge at your own pace. Every {unit === 'miles' ? 'mile' : 'kilometer'} you log tracks your
					progress across Middle-earth.
				</p>
			</div>

			<!-- Data Storage Info -->
			<div
				class="mx-auto mb-8 max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-gradient-to-br from-earth-50 to-slate-50 p-6 text-left shadow-sm"
			>
				<h3 class="font-serif text-xl font-bold text-slate-800">📊 Your Data, Your Choice</h3>
				<div class="space-y-3 text-base text-slate-700">
					<div class="rounded-lg border-l-4 border-shire-500 bg-white p-4">
						<p class="font-semibold text-shire-900">🔒 No Login Required</p>
						<p class="mt-1 text-sm text-shire-800">
							Start tracking immediately! Your journey data is stored locally in your browser. No
							account needed, completely private.
						</p>
					</div>
					<div class="rounded-lg border-l-4 border-ring-500 bg-white p-4">
						<p class="font-semibold text-ring-900">☁️ Optional Cloud Backup</p>
						<p class="mt-1 text-sm text-ring-800">
							Want to sync across devices? Sign in to back up your progress to the cloud and access
							it from anywhere. Your local data will be merged with your cloud data.
						</p>
					</div>
					<InstallPrompt />
				</div>
				<p class="text-center text-sm text-slate-600">
					Learn more in our
					<a href={resolve('/privacy')} class="font-semibold text-ring-600 hover:underline"
						>Privacy Policy</a
					>
				</p>
			</div>
			<div
				class="mx-auto mb-10 max-w-2xl rounded-xl border border-slate-200 bg-slate-50 p-8 text-left shadow-sm"
			>
				<h3 class="mb-6 font-serif text-2xl font-bold text-slate-800">
					How to Join the Fellowship:
				</h3>
				<ol class="list-decimal space-y-4 pl-6 text-lg text-slate-700">
					<li>
						Navigate to the <a
							href={resolve('/logs')}
							class="inline font-bold text-ring-600 hover:text-ring-700 hover:underline"
							>Log Journey</a
						> page.
					</li>
					<li>Enter your daily distance (in {unitLabel}).</li>
					<li>Watch your progress on the map and try to keep up with Frodo!</li>
				</ol>
			</div>

			<p class="font-medium text-ring-700 italic">
				"This is it. If I take one more step, it'll be the farthest away from home I've ever been."
			</p>
		</div>
	{:else}
		<!-- Ring Progress Visual placeholder -->
		<div class="mt-8 flex justify-center py-6">
			<div class="relative h-40 w-40">
				<!-- Simple SVG Ring -->
				<svg class="h-full w-full" viewBox="0 0 100 100">
					<circle cx="50" cy="50" r="45" fill="none" class="stroke-slate-200" stroke-width="10" />
					<circle
						cx="50"
						cy="50"
						r="45"
						fill="none"
						class="stroke-ring-500 transition-all duration-1000 ease-out"
						stroke-width="10"
						stroke-dasharray="283"
						stroke-dashoffset={283 - (283 * progressPercent) / 100}
						transform="rotate(-90 50 50)"
						stroke-linecap="round"
					/>
					<text
						x="50"
						y="55"
						text-anchor="middle"
						class="fill-slate-700 font-serif text-xl font-bold">{Math.floor(progressPercent)}%</text
					>
				</svg>
			</div>
		</div>

		<!-- Progress Chart -->
		<div class="mt-8">
			<h3 class="mb-4 font-serif text-3xl text-slate-800">You vs Frodo</h3>
			<ProgressChart {logs} {unit} />
		</div>

		<!-- Challenge Info -->
		<div class="mt-12 border-t border-slate-200 pt-6">
			<details class="group">
				<summary
					class="flex cursor-pointer list-none items-center justify-between font-serif text-lg font-bold text-slate-700"
				>
					<span>About the Challenge</span>
					<span class="transition group-open:rotate-180">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-6 w-6"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
						</svg>
					</span>
				</summary>
				<div class="mt-4 space-y-4 text-slate-600">
					<p>
						The <strong>Walking to Mordor</strong> challenge is the ultimate virtual fitness journey
						for Middle-earth fans. Based on the epic quest of Frodo and Sam in
						<em>The Lord of the Rings</em>, this challenge tasks you with covering the entire
						distance from their doorstep in Bag End to the fiery chasm of Mount Doom.
					</p>
					<p>
						<strong>Total Distance:</strong> ~1,784 miles (2,871 km)
					</p>
					<p>
						While Frodo's journey took roughly <strong>six months (185 days)</strong>—from leaving
						the Shire on September 23rd to the destruction of the Ring on March 25th—you can
						complete this challenge at your own pace. Every kilometer you log tracks your progress
						across Middle-earth.
					</p>
				</div>
			</details>
		</div>
	{/if}
</div>
