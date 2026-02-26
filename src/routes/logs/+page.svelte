<script lang="ts">
	import {
		addLog,
		deleteLog,
		deleteAllLogs,
		importLogs,
		setUnit,
		storageMode,
		journeyStore,
		type LocalStorageSchema,
		type LogEntry
	} from '$lib/storage';
	import { user } from '$lib/stores/auth';
	import ActivityLog from '$lib/components/ActivityLog.svelte';

	function handleAddLog(entry: Omit<LocalStorageSchema['logs'][number], 'id'>) {
		addLog(entry, $user);
	}

	function handleDeleteLog(id: number) {
		deleteLog(id, $user);
	}

	function handleDeleteAll() {
		deleteAllLogs($user);
	}

	function handleImport(logs: LogEntry[]) {
		importLogs(logs, $user);
	}

	function handleSetUnit(unit: 'km' | 'miles') {
		setUnit(unit, $user);
	}
</script>

<svelte:head>
	<title>Journey Logs - Journey To Mordor</title>
</svelte:head>

<div>
	{#if $storageMode === 'cloud' && !$user}
		<div
			class="rounded-lg border border-ring-200 bg-ring-50 p-6 text-center dark:border-ring-800/50 dark:bg-ring-900/20"
		>
			<h2 class="mb-2 font-serif text-3xl text-slate-800 dark:text-slate-100">Log Journey</h2>
			<p class="text-slate-700 dark:text-slate-300">
				Cloud mode requires sign-in before viewing or editing journey logs.
			</p>
		</div>
	{:else}
		<ActivityLog
			logs={$journeyStore.logs}
			unit={$journeyStore.unit}
			onSetUnit={handleSetUnit}
			onAdd={handleAddLog}
			onDelete={handleDeleteLog}
			onDeleteAll={handleDeleteAll}
			onImport={handleImport}
		/>
	{/if}
</div>
