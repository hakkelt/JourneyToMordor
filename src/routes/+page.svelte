<script lang="ts">
	import { onMount } from 'svelte';
	import { loadData, addLog, deleteLog, type LocalStorageSchema } from '$lib/storage';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import ActivityLog from '$lib/components/ActivityLog.svelte';

	let data = $state<LocalStorageSchema>({
		userProfile: { startDate: new Date().toISOString(), lastLogin: '' },
		logs: []
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
</script>

{#if !loaded}
	<div class="flex h-64 items-center justify-center">
		<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-pumpkin-500"></div>
	</div>
{:else}
	<div class="space-y-6">
		<!-- Tabs -->
		<div
			class="mx-auto flex w-fit space-x-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
		>
			<button
				class="rounded-md px-6 py-2 text-sm font-medium transition-colors {activeTab === 'dashboard'
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

		<!-- Content -->
		<div>
			{#if activeTab === 'dashboard'}
				<Dashboard logs={data.logs} startDate={data.userProfile.startDate} />
			{:else}
				<ActivityLog logs={data.logs} onAdd={handleAddLog} onDelete={handleDeleteLog} />
			{/if}
		</div>
	</div>
{/if}
