<script lang="ts">
  import type { LogEntry } from '$lib/storage';

  interface Props {
    logs: LogEntry[];
    onAdd: (entry: Omit<LogEntry, 'id'>) => void;
    onDelete: (id: number) => void;
  }

  let { logs, onAdd, onDelete }: Props = $props();

  let date = $state(new Date().toISOString().split('T')[0]);
  let distance = $state<number | null>(null);
  let note = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!distance || distance <= 0) return;

    onAdd({
      date,
      distance,
      note
    });

    // Reset form
    date = new Date().toISOString().split('T')[0];
    distance = null;
    note = '';
  }
</script>

<div class="space-y-8">
  <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <h2 class="text-2xl font-serif text-slate-800 mb-4">Log Journey</h2>
    
    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="date" class="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            id="date"
            bind:value={date}
            max={new Date().toISOString().split('T')[0]}
            required
            class="w-full rounded-md border-slate-300 shadow-sm focus:border-pumpkin-500 focus:ring-pumpkin-500 p-3"
          />
        </div>
        
        <div>
          <label for="distance" class="block text-sm font-medium text-slate-700 mb-1">Distance (km)</label>
          <input
            type="number"
            id="distance"
            bind:value={distance}
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            class="w-full rounded-md border-slate-300 shadow-sm focus:border-pumpkin-500 focus:ring-pumpkin-500 p-3"
          />
        </div>
      </div>

      <div>
        <label for="note" class="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
        <input
          type="text"
          id="note"
          bind:value={note}
          placeholder="Morning walk..."
          class="w-full rounded-md border-slate-300 shadow-sm focus:border-pumpkin-500 focus:ring-pumpkin-500 p-3"
        />
      </div>

      <button
        type="submit"
        class="block mx-auto bg-pumpkin-600 text-white py-2 px-8 rounded-md hover:bg-pumpkin-700 transition-colors font-medium"
      >
        Add Entry
      </button>
    </form>
  </div>

  <div class="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <h2 class="text-2xl font-serif text-slate-800 mb-4">History</h2>
    
    {#if logs.length === 0}
      <p class="text-slate-500 italic text-center py-4">No entries yet. Start your journey!</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="pb-2 font-medium text-slate-600">Date</th>
              <th class="pb-2 font-medium text-slate-600">Distance</th>
              <th class="pb-2 font-medium text-slate-600">Note</th>
              <th class="pb-2 font-medium text-slate-600 w-10"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#each logs as log (log.id)}
              <tr>
                <td class="py-3 text-slate-800">{log.date}</td>
                <td class="py-3 text-slate-800">{log.distance} km</td>
                <td class="py-3 text-slate-600">{log.note || '-'}</td>
                <td class="py-3 text-right">
                  <button
                    onclick={() => onDelete(log.id)}
                    aria-label="Delete entry"
                    class="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
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
