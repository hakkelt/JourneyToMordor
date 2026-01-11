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

  function handleAddLog(entry: any) {
    const newData = addLog(entry);
    data = newData;
  }
  
  function handleDeleteLog(id: number) {
      const newData = deleteLog(id);
      data = newData;
  }
</script>

{#if !loaded}
  <div class="flex justify-center items-center h-64">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-pumpkin-500"></div>
  </div>
{:else}
  <div class="space-y-6">
    <!-- Tabs -->
    <div class="flex space-x-1 bg-white p-1 rounded-lg border border-slate-200 w-fit mx-auto shadow-sm">
      <button
        class="px-6 py-2 rounded-md text-sm font-medium transition-colors {activeTab === 'dashboard' ? 'bg-slate-800 text-pumpkin-400' : 'text-slate-600 hover:text-slate-900'}"
        onclick={() => activeTab = 'dashboard'}
      >
        Dashboard
      </button>
      <button
        class="px-6 py-2 rounded-md text-sm font-medium transition-colors {activeTab === 'log' ? 'bg-slate-800 text-pumpkin-400' : 'text-slate-600 hover:text-slate-900'}"
        onclick={() => activeTab = 'log'}
      >
        Log Journey
      </button>
    </div>

    <!-- Content -->
    <div>
      {#if activeTab === 'dashboard'}
        <Dashboard logs={data.logs} startDate={data.userProfile.startDate} />
      {:else}
        <ActivityLog 
          logs={data.logs} 
          onAdd={handleAddLog} 
          onDelete={handleDeleteLog} 
        />
      {/if}
    </div>
  </div>
{/if}
