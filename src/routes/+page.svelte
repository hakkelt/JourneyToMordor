<script lang="ts">
	import {
		discardPendingCloudChangesAndResetMode,
		journeyStore,
		setStorageMode,
		storageMode,
		type StorageMode
	} from '$lib/storage';
	import { user } from '$lib/stores/auth';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import AuthModal from '$lib/components/AuthModal.svelte';

	function handleSelectMode(mode: StorageMode) {
		setStorageMode(mode);
	}

	let showForcedAuthModal = $derived($storageMode === 'cloud' && !$user);
</script>

<svelte:head>
	<title>Dashboard - Journey To Mordor</title>
</svelte:head>

<Dashboard
	logs={$journeyStore.logs}
	unit={$journeyStore.unit}
	storageMode={$storageMode}
	onSelectStorageMode={handleSelectMode}
/>

{#if showForcedAuthModal}
	<AuthModal onClose={discardPendingCloudChangesAndResetMode} onAuthSuccess={() => {}} />
{/if}
