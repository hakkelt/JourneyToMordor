<script lang="ts">
	import type { LogEntry } from '$lib/storage';
	import { LOCATIONS } from '$lib/data';
	import ProgressChart from './ProgressChart.svelte';

	interface Props {
		logs: LogEntry[];
		startDate: string;
	}

	let { logs, startDate }: Props = $props();

	// Derived state
	let totalDistance = $derived(logs.reduce((sum, log) => sum + log.distance, 0));

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
	{#if logs.length === 0}
		<div class="rounded-lg border-t-4 border-pumpkin-500 bg-white p-8 text-center shadow-md">
			<h2 class="mb-4 font-serif text-3xl text-slate-800">Welcome, Ringbearer</h2>
			<p class="mb-6 text-lg text-slate-600">
				Your journey from the Shire to Mount Mordor begins with a single step. Track your daily
				walking or running distance to advance towards the fires of Mount Doom.
			</p>

			<div class="mx-auto mb-8 max-w-md rounded-md bg-slate-50 p-4 text-left">
				<h3 class="mb-2 font-bold text-slate-700">How it works:</h3>
				<ol class="list-decimal space-y-2 pl-5 text-slate-600">
					<li>Go to the <strong>Log</strong> tab.</li>
					<li>Enter your daily distance (in km).</li>
					<li>Watch your progress on the map and compare your pace with Frodo's.</li>
				</ol>
			</div>

			<p class="font-medium text-pumpkin-700 italic">
				"This is it. If I take one more step, it'll be the farthest away from home I've ever been."
			</p>
		</div>
	{:else}
		<!-- Status Header -->
		<div class="relative flex h-64 items-end overflow-hidden rounded-lg shadow-md">
			<div
				class="absolute inset-0 bg-cover bg-center"
				style="background-image: url('{bgImage}');"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-90"></div>

			<div class="relative z-10 w-full p-6 text-white">
				<div class="mb-1 text-sm font-bold tracking-wider text-pumpkin-400 uppercase">
					Current Location
				</div>
				<h2 class="mb-2 font-serif text-3xl font-bold">{currentLocation.name}</h2>
				<p class="text-sm italic opacity-80">"{currentLocation.quote}"</p>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
			<div class="rounded-lg border-l-4 border-pumpkin-500 bg-white p-4 shadow-sm">
				<div class="mb-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
					Total Distance
				</div>
				<div class="text-2xl font-bold text-slate-800">
					{totalDistance.toFixed(1)} <span class="text-sm font-normal text-slate-500">km</span>
				</div>
			</div>

			<div class="rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-sm">
				<div class="mb-1 text-xs font-bold tracking-wide text-slate-500 uppercase">Next Stop</div>
				<div class="truncate text-2xl font-bold text-slate-800" title={nextMilestone.name}>
					{nextMilestone.name}
				</div>
			</div>

			<div class="rounded-lg border-l-4 border-purple-500 bg-white p-4 shadow-sm">
				<div class="mb-1 text-xs font-bold tracking-wide text-slate-500 uppercase">
					Remaining until next stop
				</div>
				<div class="text-2xl font-bold text-slate-800">
					{isFinished ? 'Done!' : `${distanceRemaining.toFixed(1)} km`}
				</div>
			</div>
		</div>

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
						class="stroke-pumpkin-500 transition-all duration-1000 ease-out"
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
			<h3 class="mb-4 font-serif text-xl text-slate-800">You vs Frodo</h3>
			<ProgressChart {logs} {startDate} />
		</div>
	{/if}
</div>
