<script lang="ts">
	import {
		addLog,
		deleteLog,
		deleteAllLogs,
		importLogs,
		setUnit,
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
	<ActivityLog
		logs={$journeyStore.logs}
		unit={$journeyStore.unit}
		onSetUnit={handleSetUnit}
		onAdd={handleAddLog}
		onDelete={handleDeleteLog}
		onDeleteAll={handleDeleteAll}
		onImport={handleImport}
	/>
</div>
