<script lang="ts">
	import { notifications, dismissNotification } from '$lib/stores/notifications';
</script>

<div class="pointer-events-none fixed right-4 bottom-4 z-[70] flex max-w-sm flex-col gap-2">
	{#each $notifications as item (item.id)}
		<div
			class="pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-md {item.type ===
			'success'
				? 'border-shire-300 bg-shire-50 text-shire-900 dark:border-shire-700 dark:bg-shire-900/30 dark:text-shire-200'
				: item.type === 'error'
					? 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200'
					: 'border-ring-300 bg-ring-50 text-ring-900 dark:border-ring-700 dark:bg-ring-900/30 dark:text-ring-200'}"
		>
			<div class="flex items-start justify-between gap-3">
				<p>{item.message}</p>
				<button
					type="button"
					onclick={() => dismissNotification(item.id)}
					class="text-xs font-semibold opacity-80 hover:opacity-100"
				>
					Dismiss
				</button>
			</div>
		</div>
	{/each}
</div>
