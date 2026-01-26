<script lang="ts">
	import { journeyStore } from '$lib/storage';
	import Dashboard from '$lib/components/Dashboard.svelte';
</script>

<svelte:head>
	<title>Dashboard - Journey To Mordor</title>
</svelte:head>

<Dashboard logs={$journeyStore.logs} unit={$journeyStore.unit} />
