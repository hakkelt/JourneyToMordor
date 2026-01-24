<script lang="ts">
	import { onMount } from 'svelte';
	import { loadData, addLog, deleteLog, setUnit, type LocalStorageSchema } from '$lib/storage';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import ActivityLog from '$lib/components/ActivityLog.svelte';

	let data = $state<LocalStorageSchema>({
		logs: [],
		unit: 'km'
	});
	let activeTab = $state<'dashboard' | 'log'>('dashboard');
	let loaded = $state(false);

	onMount(() => {
		data = loadData();
		loaded = true;
	});

	function handleAddLog(entry: Omit<LocalStorageSchema['logs'][number], 'id'>) {
		const newData = addLog(entry);
		data = newData;
	}

	function handleDeleteLog(id: number) {
		const newData = deleteLog(id);
		data = newData;
	}

	function handleSetUnit(unit: 'km' | 'miles') {
		const newData = setUnit(unit);
		data = newData;
	}
</script>

{#if !loaded}
	<div class="flex h-64 items-center justify-center">
		<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-pumpkin-500"></div>
	</div>
{:else}
	<div class="space-y-6">
		<!-- Header with Tabs and Unit Selector -->
		<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
			<!-- Tabs -->
			<div class="flex w-fit space-x-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
				<button
					class="rounded-md px-6 py-2 text-sm font-medium transition-colors {activeTab ===
					'dashboard'
						? 'bg-slate-800 text-pumpkin-400'
						: 'text-slate-600 hover:text-slate-900'}"
					onclick={() => (activeTab = 'dashboard')}
				>
					Dashboard
				</button>
				<button
					class="rounded-md px-6 py-2 text-sm font-medium transition-colors {activeTab === 'log'
						? 'bg-slate-800 text-pumpkin-400'
						: 'text-slate-600 hover:text-slate-900'}"
					onclick={() => (activeTab = 'log')}
				>
					Log Journey
				</button>
			</div>

			<!-- Unit Selector -->
			<div
				class="flex items-center space-x-3 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm"
			>
				<span class="text-sm font-medium text-slate-600">Units:</span>
				<div class="flex rounded-md border border-slate-200 bg-slate-50 p-1">
					<button
						class="rounded px-3 py-1 text-sm font-medium transition-colors {data.unit === 'km'
							? 'bg-white text-pumpkin-600 shadow-sm'
							: 'text-slate-500 hover:text-slate-700'}"
						onclick={() => handleSetUnit('km')}
					>
						km
					</button>
					<button
						class="rounded px-3 py-1 text-sm font-medium transition-colors {data.unit === 'miles'
							? 'bg-white text-pumpkin-600 shadow-sm'
							: 'text-slate-500 hover:text-slate-700'}"
						onclick={() => handleSetUnit('miles')}
					>
						miles
					</button>
				</div>
			</div>
		</div>

		<!-- Content -->
		<div>
			{#if activeTab === 'dashboard'}
				<Dashboard
					logs={data.logs}
					unit={data.unit}
					onNavigate={(tab) => (activeTab = tab)}
					onUnitChange={handleSetUnit}
				/>
			{:else}
				<ActivityLog
					logs={data.logs}
					unit={data.unit}
					onAdd={handleAddLog}
					onDelete={handleDeleteLog}
				/>
			{/if}
		</div>
	</div>
{/if}
