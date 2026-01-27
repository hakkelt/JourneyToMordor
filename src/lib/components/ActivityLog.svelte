<script lang="ts">
	import type { LogEntry } from '$lib/storage';
	import { convertToCSV, downloadCSV, parseCSV } from '$lib/csv';
	import { user } from '$lib/stores/auth';
	import { isOnline, hasPendingSync } from '$lib/stores/network';

	interface Props {
		logs: LogEntry[];
		unit?: 'km' | 'miles';
		onAdd: (entry: Omit<LogEntry, 'id'>) => void;
		onDelete: (id: number) => void;
		onDeleteAll: () => void;
		onImport: (logs: LogEntry[]) => void;
	}

	let { logs, unit = 'km', onAdd, onDelete, onDeleteAll, onImport }: Props = $props();

	let date = $state(new Date().toISOString().split('T')[0]);
	let distance = $state<number | null>(null);
	let note = $state('');

	const MILES_TO_KM = 1.60934;
	const KM_TO_MILES = 0.621371;

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (!distance || distance <= 0) return;

		let distanceInKm = distance;
		if (unit === 'miles') {
			distanceInKm = distance * MILES_TO_KM;
		}

		onAdd({
			date,
			distance: distanceInKm,
			note
		});

		// Reset form
		date = new Date().toISOString().split('T')[0];
		distance = null;
		note = '';
	}

	function formatDist(km: number): string {
		if (unit === 'miles') return (km * KM_TO_MILES).toFixed(2);
		return km.toFixed(2);
	}

	function handleDownloadCSV() {
		const csvContent = convertToCSV(logs, unit);
		const timestamp = new Date().toISOString().split('T')[0];
		downloadCSV(csvContent, `journey-to-mordor-${timestamp}.csv`);
	}

	let fileInput: HTMLInputElement;
	let showDeleteConfirm = $state(false);
	let showImportConfirm = $state(false);
	let pendingImportLogs = $state<LogEntry[]>([]);
	let importError = $state<string | null>(null);

	function triggerImport() {
		fileInput.click();
	}

	async function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;

		const file = target.files[0];
		try {
			const text = await file.text();
			const parsed = parseCSV(text);

			if (logs.length > 0) {
				pendingImportLogs = parsed;
				importError = null;
				showImportConfirm = true;
			} else {
				onImport(parsed);
			}
		} catch (err) {
			console.error(err);
			importError = (err as Error).message || 'Failed to parse CSV';
			alert(`Error importing CSV: ${importError}`);
		} finally {
			// Reset input so same file can be selected again if needed
			target.value = '';
		}
	}

	function confirmImport() {
		onImport(pendingImportLogs);
		showImportConfirm = false;
		pendingImportLogs = [];
	}

	function confirmDeleteAll() {
		onDeleteAll();
		showDeleteConfirm = false;
	}

	let showSyncBanner = $state(false);
	let syncStartTime = 0;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const actuallySyncing = $user && $isOnline && $hasPendingSync;

		// Clear existing timer if any
		if (hideTimer) {
			clearTimeout(hideTimer);
			hideTimer = undefined;
		}

		if (actuallySyncing) {
			if (!showSyncBanner) {
				showSyncBanner = true;
				syncStartTime = Date.now();
			}
		} else {
			// Not syncing
			if (showSyncBanner) {
				if (!$isOnline) {
					// User went offline: hide sync banner immediately (offline banner takes precedence)
					showSyncBanner = false;
				} else {
					// Online and done: delay hide
					const elapsed = Date.now() - syncStartTime;
					const delay = Math.max(0, 3000 - elapsed);

					hideTimer = setTimeout(() => {
						if (!$hasPendingSync) {
							showSyncBanner = false;
						}
					}, delay);
				}
			}
		}

		return () => {
			if (hideTimer) clearTimeout(hideTimer);
		};
	});
</script>

<input type="file" accept=".csv" class="hidden" bind:this={fileInput} onchange={handleFileSelect} />

{#if showDeleteConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h3 class="mb-2 text-xl font-bold text-red-600">Warning: Data Loss</h3>
			<p class="mb-6 text-slate-600">
				Are you sure you want to delete ALL log entries? This action cannot be undone.
			</p>
			<div class="flex justify-end gap-3">
				<button
					class="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
					onclick={() => (showDeleteConfirm = false)}
				>
					Cancel
				</button>
				<button
					class="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
					onclick={confirmDeleteAll}
				>
					Delete All
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showImportConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<h3 class="mb-2 text-xl font-bold text-ring-600">Confirm Import</h3>
			<p class="mb-4 text-slate-600">
				Importing will <strong>replace</strong> your current history with
				<strong>{pendingImportLogs.length}</strong> entries.
			</p>
			<p class="mb-6 text-sm text-slate-500">Current data will be lost.</p>
			<div class="flex justify-end gap-3">
				<button
					class="rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
					onclick={() => (showImportConfirm = false)}
				>
					Cancel
				</button>
				<button
					class="rounded-md bg-ring-600 px-4 py-2 font-medium text-white hover:bg-ring-700"
					onclick={confirmImport}
				>
					Import Data
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="space-y-8">
	{#if $user && (!$isOnline || showSyncBanner)}
		<div
			class="mx-auto max-w-4xl rounded-md border p-4 {$isOnline
				? 'border-amber-200 bg-amber-50 text-amber-800'
				: 'border-slate-200 bg-slate-100 text-slate-700'}"
		>
			<div class="flex items-center gap-3">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="h-5 w-5"
				>
					{#if !$isOnline}
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
							clip-rule="evenodd"
						/>
					{:else}
						<path
							fill-rule="evenodd"
							d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
							clip-rule="evenodd"
						/>
					{/if}
				</svg>
				<p class="text-sm font-medium">
					{#if !$isOnline}
						You are currently offline. Changes will be saved locally and synced when you reconnect.
					{:else}
						Syncing changes...
					{/if}
				</p>
			</div>
		</div>
	{/if}
	<div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="mb-4 font-serif text-3xl text-slate-800">Log Journey</h2>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label for="date" class="mb-1 block text-sm font-medium text-slate-700">Date</label>
					<input
						type="date"
						id="date"
						bind:value={date}
						max={new Date().toISOString().split('T')[0]}
						required
						class="w-full rounded-md border-slate-300 p-3 shadow-sm focus:border-ring-500 focus:ring-ring-500"
					/>
				</div>

				<div>
					<label for="distance" class="mb-1 block text-sm font-medium text-slate-700"
						>Distance ({unit === 'miles' ? 'miles' : 'km'})</label
					>
					<input
						type="number"
						id="distance"
						bind:value={distance}
						step="0.01"
						min="0.01"
						required
						placeholder="0.00"
						class="w-full rounded-md border-slate-300 p-3 shadow-sm focus:border-ring-500 focus:ring-ring-500"
					/>
				</div>
			</div>

			<div>
				<label for="note" class="mb-1 block text-sm font-medium text-slate-700"
					>Note (Optional)</label
				>
				<input
					type="text"
					id="note"
					bind:value={note}
					placeholder="Morning walk..."
					class="w-full rounded-md border-slate-300 p-3 shadow-sm focus:border-ring-500 focus:ring-ring-500"
				/>
			</div>

			<button
				type="submit"
				class="mx-auto block rounded-md bg-ring-600 px-8 py-2 font-medium text-white transition-colors hover:bg-ring-700"
			>
				Add Entry
			</button>
		</form>
	</div>

	<div class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
		<div class="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<h2 class="font-serif text-3xl text-slate-800">History</h2>
			<div class="flex flex-wrap gap-2 text-sm text-slate-700">
				<button
					onclick={triggerImport}
					class="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium transition-colors hover:bg-slate-50 hover:text-ring-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-4 w-4"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
						/>
					</svg>
					Import CSV
				</button>

				{#if logs.length > 0}
					<button
						onclick={handleDownloadCSV}
						class="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 font-medium transition-colors hover:bg-slate-50 hover:text-ring-600"
						aria-label="Download log entries as CSV"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-4 w-4"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
							/>
						</svg>
						Download CSV
					</button>

					<button
						onclick={() => (showDeleteConfirm = true)}
						class="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 font-medium text-red-700 transition-colors hover:bg-red-100"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="h-4 w-4"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
							/>
						</svg>
						Delete All
					</button>
				{/if}
			</div>
		</div>

		{#if logs.length === 0}
			<p class="py-4 text-center text-slate-500 italic">No entries yet. Start your journey!</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-left">
					<thead>
						<tr class="border-b border-slate-200">
							<th class="pb-2 font-medium text-slate-600">Date</th>
							<th class="pb-2 font-medium text-slate-600"
								>Distance ({unit === 'miles' ? 'miles' : 'km'})</th
							>
							<th class="pb-2 font-medium text-slate-600">Note</th>
							<th class="w-10 pb-2 font-medium text-slate-600"></th>
						</tr>
					</thead>
					<tbody class="divide-y divide-earth-100">
						{#each logs as log (log.id)}
							<tr>
								<td class="py-3 text-slate-800">{log.date}</td>
								<td class="py-3 text-slate-800"
									>{formatDist(log.distance)} {unit === 'miles' ? 'miles' : 'km'}</td
								>
								<td class="py-3 text-slate-600">{log.note || '-'}</td>
								<td class="py-3 text-right">
									<button
										onclick={() => onDelete(log.id)}
										aria-label="Delete entry"
										class="text-slate-400 transition-colors hover:text-red-500"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											class="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fill-rule="evenodd"
												d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
												clip-rule="evenodd"
											/>
										</svg>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
