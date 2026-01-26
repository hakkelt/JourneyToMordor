<script lang="ts">
	import { user } from '$lib/stores/auth';
	import { auth } from '$lib/firebase';
	import { signOut } from 'firebase/auth';
	import { syncWithFirestore } from '$lib/storage';
	import AuthModal from './AuthModal.svelte';

	let showModal = $state(false);

	function openModal() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	async function logout() {
		await signOut(auth);
	}

	// Track the last synced user ID to avoid re-syncing unnecessarily
	let lastUid = $state('');

	$effect(() => {
		if ($user && $user.uid !== lastUid) {
			lastUid = $user.uid;
			// Trigger sync when user changes (logs in)
			syncWithFirestore($user);
		} else if (!$user) {
			lastUid = '';
		}
	});
</script>

<div class="flex items-center gap-4">
	{#if $user}
		<div class="flex items-center gap-3">
			{#if $user.photoURL}
				<img
					src={$user.photoURL}
					alt={$user.displayName ?? 'User'}
					class="h-8 w-8 rounded-full border border-slate-300"
				/>
			{/if}
			<div class="hidden flex-col text-sm sm:flex">
				<span class="font-medium text-slate-700">{$user.displayName}</span>
				<div class="flex gap-2">
					<button
						onclick={logout}
						class="text-left text-xs text-slate-500 hover:text-pumpkin-600 hover:underline"
						>Sign Out</button
					>
				</div>
			</div>
			<div class="flex flex-col items-end gap-1 sm:hidden">
				<button onclick={logout} class="text-sm text-slate-600">Sign Out</button>
			</div>
		</div>
	{:else}
		<button
			onclick={openModal}
			class="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 ring-inset hover:bg-slate-50"
		>
			Sign In
		</button>
	{/if}
</div>

{#if showModal}
	<AuthModal onClose={closeModal} />
{/if}
