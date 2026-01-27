<script lang="ts">
	import { user } from '$lib/stores/auth';
	import { auth } from '$lib/firebase';
	import { signOut } from 'firebase/auth';
	import { syncWithFirestore } from '$lib/storage';
	import { isOnline } from '$lib/stores/network';
	import AuthModal from './AuthModal.svelte';

	let showModal = $state(false);

	function openModal() {
		if (!$isOnline) return;
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	async function logout() {
		if (!$isOnline) return;
		await signOut(auth);
	}

	// Track the last synced user ID to avoid re-syncing unnecessarily
	let lastUid = $state('');

	$effect(() => {
		if ($user && $user.uid !== lastUid) {
			lastUid = $user.uid;
			// Trigger sync when user changes (logs in)
			if ($isOnline) {
				syncWithFirestore($user);
			}
		} else if (!$user) {
			lastUid = '';
		}
	});

	// Trigger sync when coming back online
	$effect(() => {
		if ($isOnline && $user) {
			syncWithFirestore($user);
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
					class="h-8 w-8 rounded-full border border-slate-700 shadow-sm"
					width="32"
					height="32"
				/>
			{/if}
			<div class="hidden flex-col text-sm sm:flex">
				<span class="font-medium text-slate-200">{$user.displayName}</span>
				<div class="flex gap-2">
					<button
						onclick={logout}
						disabled={!$isOnline}
						class="text-left text-xs whitespace-nowrap text-slate-400 hover:text-ring-400 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
						>{$isOnline ? 'Sign Out' : 'Offline'}</button
					>
				</div>
			</div>
			<div class="flex flex-col items-end gap-1 sm:hidden">
				<button
					onclick={logout}
					disabled={!$isOnline}
					class="text-sm font-medium whitespace-nowrap text-slate-300 active:text-ring-400 disabled:cursor-not-allowed disabled:opacity-50"
					>{$isOnline ? 'Sign Out' : 'Offline'}</button
				>
			</div>
		</div>
	{:else}
		<button
			onclick={openModal}
			disabled={!$isOnline}
			class="rounded-full bg-ring-600 px-5 py-2 text-sm font-bold whitespace-nowrap text-white shadow-sm transition-all hover:bg-ring-500 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-ring-600"
		>
			{$isOnline ? 'Sign In' : 'Offline'}
		</button>
	{/if}
</div>

{#if showModal}
	<AuthModal onClose={closeModal} />
{/if}
