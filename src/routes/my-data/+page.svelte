<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/auth';
	import {
		journeyStore,
		resetData,
		resetStorageMode,
		saveData,
		deleteUserAccount,
		setUnit,
		storageMode,
		changeStorageMode,
		isInstalledPWA,
		CLOUD_MODE_DESC_BROWSER,
		CLOUD_MODE_DESC_INSTALLED,
		CLOUD_MODE_DESC_LINE2,
		LOCAL_MODE_DESC_LINE1,
		LOCAL_MODE_DESC_LINE2,
		type StorageMode
	} from '$lib/storage';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/firebase';
	import { signOut } from 'firebase/auth';
	import { notify } from '$lib/stores/notifications';

	const KM_TO_MILES = 0.621371;

	let showDeleteConfirm = $state(false);
	let showLocalDataConfirm = $state(false);
	let showModeChangeConfirm = $state(false);
	let pendingMode = $state<StorageMode | null>(null);
	let deleteAccountWithSwitch = $state(false);
	let keepLocalDataForCloudSwitch = $state(true);
	let discardDataOnLocalSwitch = $state(false);
	let deleteConfirmText = $state('');
	let localDataConfirmText = $state('');
	let isInstalled = $state(false);

	onMount(() => {
		window.scrollTo(0, 0);
		isInstalled = isInstalledPWA();
	});

	async function handleDeleteAccount() {
		if (!$user) return;

		if (deleteConfirmText !== 'DELETE') {
			notify('error', 'Please type DELETE to confirm.');
			return;
		}

		try {
			await deleteUserAccount($user);
			notify('success', 'Account deleted successfully. Device data was cleared.');
			showDeleteConfirm = false;
			goto(resolve('/'));
		} catch (e: unknown) {
			const error = e as { code?: string };
			if (error.code === 'auth/requires-recent-login') {
				notify(
					'error',
					'For security reasons, this operation requires a recent login. Please sign out and sign in again before deleting your account.'
				);
			} else {
				notify('error', 'Failed to delete account. Please try again later.');
				console.error(e);
			}
		}
	}

	function handleClearLocalData() {
		if (localDataConfirmText !== 'CLEAR') {
			notify('error', 'Please type CLEAR to confirm.');
			return;
		}

		resetData();
		resetStorageMode();
		notify('success', 'Data on this device was cleared.');
		showLocalDataConfirm = false;
		localDataConfirmText = '';
		goto(resolve('/'));
	}

	function downloadData() {
		const data = {
			user: $user
				? {
						uid: $user.uid,
						email: $user.email,
						displayName: $user.displayName
					}
				: null,
			journeyData: $journeyStore
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `journey-to-mordor-data-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function handleSetUnit(unit: 'km' | 'miles') {
		setUnit(unit, $user);
	}

	interface ModeWarning {
		title: string;
		details: string;
		askDeleteAccount: boolean;
		askKeepLocalData: boolean;
		askDiscardData: boolean;
	}

	function getModeChangeWarning(from: StorageMode, to: StorageMode): ModeWarning {
		if (from === 'local' && to === 'cloud') {
			return {
				title: 'Switch to cloud mode?',
				details:
					'Cloud mode requires sign-in for Logs and My Data. Data saved on this device will be cleared after switching.',
				askDeleteAccount: false,
				askKeepLocalData: true,
				askDiscardData: false
			};
		}

		if (from === 'cloud' && to === 'local') {
			return {
				title: 'Switch to local mode?',
				details:
					'You will be signed out and syncing will be disabled. You can keep your current journey data on this device or discard it and start fresh.',
				askDeleteAccount: true,
				askKeepLocalData: false,
				askDiscardData: true
			};
		}

		return {
			title: 'Switch storage mode?',
			details: 'Confirm changing data storage mode.',
			askDeleteAccount: false,
			askKeepLocalData: false,
			askDiscardData: false
		};
	}

	let modeWarning = $derived(
		pendingMode && $storageMode ? getModeChangeWarning($storageMode, pendingMode) : null
	);

	async function applyStorageModeChange(mode: StorageMode, shouldDeleteAccount: boolean) {
		const previousMode = $storageMode;

		if (!previousMode || previousMode === mode) return;
		const snapshot = {
			...$journeyStore,
			logs: [...$journeyStore.logs],
			deletedLogIds: [...$journeyStore.deletedLogIds]
		};

		if (previousMode === 'local' && mode === 'cloud') {
			if (!keepLocalDataForCloudSwitch) {
				resetData();
			}
			await changeStorageMode(mode, $user);

			if (keepLocalDataForCloudSwitch) {
				journeyStore.set(snapshot);
			}

			notify('success', 'Cloud mode enabled. Data on this device was cleared.');
			if (!$user) {
				goto(resolve('/'));
			}
			return;
		}

		if (previousMode === 'cloud' && mode === 'local') {
			if (shouldDeleteAccount && $user) {
				await deleteUserAccount($user);
			} else if ($user) {
				await signOut(auth);
			}

			await changeStorageMode(mode, null);
			if (discardDataOnLocalSwitch) {
				resetData();
			} else {
				journeyStore.set(snapshot);
				saveData(snapshot);
			}

			notify('success', 'Local mode enabled.');
			goto(resolve('/'));
			return;
		}

		await changeStorageMode(mode, $user);
		notify('success', `Storage mode switched to ${mode}.`);

		if (mode === 'cloud' && !$user) {
			goto(resolve('/'));
		}
	}

	async function handleStorageModeChange(mode: StorageMode) {
		if ($storageMode === mode) return;

		if ($storageMode) {
			pendingMode = mode;
			deleteAccountWithSwitch = false;
			keepLocalDataForCloudSwitch = true;
			discardDataOnLocalSwitch = false;
			showModeChangeConfirm = true;
			return;
		}

		await applyStorageModeChange(mode, false);
	}

	async function confirmModeChange() {
		if (!pendingMode) return;

		const mode = pendingMode;
		pendingMode = null;
		showModeChangeConfirm = false;
		await applyStorageModeChange(mode, deleteAccountWithSwitch);
		deleteAccountWithSwitch = false;
	}

	function cancelModeChange() {
		pendingMode = null;
		showModeChangeConfirm = false;
		deleteAccountWithSwitch = false;
		keepLocalDataForCloudSwitch = true;
		discardDataOnLocalSwitch = false;
	}

	function formatDistanceForUnit(distanceInKm: number): string {
		if ($journeyStore.unit === 'miles') {
			return (distanceInKm * KM_TO_MILES).toFixed(1);
		}

		return distanceInKm.toFixed(1);
	}
</script>

<svelte:head>
	<title>My Data - Journey To Mordor</title>
	<meta name="description" content="View and manage your Journey To Mordor data" />
</svelte:head>

{#if showModeChangeConfirm && modeWarning}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl dark:bg-slate-700">
			<h3 class="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">{modeWarning.title}</h3>
			<p class="mb-4 text-sm text-slate-700 dark:text-slate-300">{modeWarning.details}</p>

			{#if modeWarning.askDeleteAccount && $user}
				<label class="mb-4 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
					<input
						type="checkbox"
						bind:checked={deleteAccountWithSwitch}
						class="mt-0.5 h-4 w-4 rounded border-slate-300 text-ring-600 focus:ring-ring-500"
					/>
					<span
						>Also delete my cloud account data now. This can require manual cleanup on other
						devices.</span
					>
				</label>
			{/if}

			{#if modeWarning.askKeepLocalData}
				<label class="mb-4 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
					<input
						type="checkbox"
						bind:checked={keepLocalDataForCloudSwitch}
						class="mt-0.5 h-4 w-4 rounded border-slate-300 text-ring-600 focus:ring-ring-500"
					/>
					<span>Keep current device data to merge with cloud data after sign-in</span>
				</label>
			{/if}

			{#if modeWarning.askDiscardData}
				<label class="mb-4 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
					<input
						type="checkbox"
						bind:checked={discardDataOnLocalSwitch}
						class="mt-0.5 h-4 w-4 rounded border-slate-300 text-ring-600 focus:ring-ring-500"
					/>
					<span>Discard current data and start with empty local history</span>
				</label>
			{/if}

			<div class="flex justify-end gap-3">
				<button
					type="button"
					onclick={cancelModeChange}
					class="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500"
				>
					Cancel
				</button>
				<button
					type="button"
					onclick={confirmModeChange}
					class="rounded-lg bg-ring-600 px-4 py-2 font-semibold text-white hover:bg-ring-700"
				>
					Confirm Switch
				</button>
			</div>
		</div>
	</div>
{/if}

<div class="mx-auto max-w-4xl space-y-6">
	<div class="rounded-lg bg-white p-8 shadow-md dark:bg-slate-700">
		<h1 class="mb-6 font-serif text-5xl font-normal text-slate-800 dark:text-slate-100">My Data</h1>

		<!-- Account Information -->
		{#if $storageMode !== 'local'}
			<section class="mb-8 space-y-4">
				<h2 class="font-serif text-3xl font-normal text-slate-800 dark:text-slate-100">
					Account Information
				</h2>
				{#if $user}
					<div
						class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-600"
					>
						<div class="space-y-2">
							<div class="flex items-start justify-between">
								<div>
									<p class="text-sm font-medium text-slate-600 dark:text-slate-400">User ID</p>
									<p class="font-mono text-sm text-slate-800 dark:text-slate-200">{$user.uid}</p>
								</div>
							</div>
							{#if $user.email}
								<div>
									<p class="text-sm font-medium text-slate-600 dark:text-slate-400">Email</p>
									<p class="text-slate-800 dark:text-slate-200">{$user.email}</p>
								</div>
							{/if}
							{#if $user.displayName}
								<div>
									<p class="text-sm font-medium text-slate-600 dark:text-slate-400">Display Name</p>
									<p class="text-slate-800 dark:text-slate-200">{$user.displayName}</p>
								</div>
							{/if}
							<div>
								<p class="text-sm font-medium text-slate-600 dark:text-slate-400">Email Verified</p>
								<p class="text-slate-800 dark:text-slate-200">
									{$user.emailVerified ? 'Yes' : 'No'}
								</p>
							</div>
						</div>
					</div>
				{:else}
					<div
						class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-600"
					>
						<p class="font-medium text-shire-900 dark:text-slate-300">
							You are not signed in. Your data is stored locally in your browser only.
						</p>
					</div>
				{/if}
			</section>
		{/if}

		<!-- Journey Data -->
		<section class="mb-8 space-y-4">
			<h2 class="font-serif text-3xl font-normal text-slate-800 dark:text-slate-100">
				Storage Mode
			</h2>
			<div
				class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-600"
			>
				<p class="text-sm text-slate-700 dark:text-slate-300">
					Current mode:
					<strong class="text-slate-900 dark:text-slate-100">{$storageMode}</strong>
				</p>
				<div class="mt-4 grid gap-3 md:grid-cols-2">
					<button
						type="button"
						onclick={() => handleStorageModeChange('local')}
						class="rounded-lg border-l-4 border-shire-500 bg-white p-3 text-left transition hover:bg-shire-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700"
						disabled={$storageMode === 'local'}
					>
						<p class="font-semibold text-shire-900 dark:text-shire-300">Local mode</p>
						<p class="text-xs text-shire-800 dark:text-shire-300">
							{LOCAL_MODE_DESC_LINE1}
						</p>
						<p class="text-xs text-shire-800 dark:text-shire-300">
							{LOCAL_MODE_DESC_LINE2}
						</p>
					</button>
					<button
						type="button"
						onclick={() => handleStorageModeChange('cloud')}
						class="rounded-lg border-l-4 border-ring-500 bg-white p-3 text-left transition hover:bg-ring-50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700"
						disabled={$storageMode === 'cloud'}
					>
						<p class="font-semibold text-ring-900 dark:text-ring-300">Cloud mode</p>
						<p class="text-xs text-ring-800 dark:text-ring-300">
							{isInstalled ? CLOUD_MODE_DESC_INSTALLED : CLOUD_MODE_DESC_BROWSER}
						</p>
						<p class="text-xs text-ring-800 dark:text-ring-300">
							{CLOUD_MODE_DESC_LINE2}
						</p>
					</button>
				</div>
			</div>
		</section>

		<section class="mb-8 space-y-4">
			<h2 class="font-serif text-3xl font-normal text-slate-800 dark:text-slate-100">
				Journey Data
			</h2>
			<div
				class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-600"
			>
				<div class="space-y-3">
					<div>
						<p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Log Entries</p>
						<p class="text-2xl font-bold text-slate-800 dark:text-slate-100">
							{$journeyStore.logs.length}
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-600 dark:text-slate-400">Unit Preference</p>
						<div
							class="mt-2 flex h-9 max-w-xs items-center rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-500 dark:bg-slate-700"
						>
							<button
								type="button"
								class="flex h-full flex-1 items-center justify-center rounded-md text-sm font-semibold transition-all {$journeyStore.unit ===
								'km'
									? 'bg-ring-600 text-white'
									: 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}"
								onclick={() => handleSetUnit('km')}
								aria-label="Set unit to kilometers"
								aria-pressed={$journeyStore.unit === 'km'}
							>
								Kilometers
							</button>
							<button
								type="button"
								class="flex h-full flex-1 items-center justify-center rounded-md text-sm font-semibold transition-all {$journeyStore.unit ===
								'miles'
									? 'bg-ring-600 text-white'
									: 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}"
								onclick={() => handleSetUnit('miles')}
								aria-label="Set unit to miles"
								aria-pressed={$journeyStore.unit === 'miles'}
							>
								Miles
							</button>
						</div>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Distance</p>
						<p class="text-slate-800 dark:text-slate-200">
							{formatDistanceForUnit(
								$journeyStore.logs.reduce((sum, log) => sum + log.distance, 0)
							)}
							{$journeyStore.unit}
						</p>
					</div>
					{#if $journeyStore.logs.length > 0}
						<div>
							<p class="text-sm font-medium text-slate-600 dark:text-slate-400">Date Range</p>
							<p class="text-slate-800 dark:text-slate-200">
								{new Date(
									Math.min(...$journeyStore.logs.map((log) => new Date(log.date).getTime()))
								).toLocaleDateString()}
								-
								{new Date(
									Math.max(...$journeyStore.logs.map((log) => new Date(log.date).getTime()))
								).toLocaleDateString()}
							</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Log Entries Preview -->
			{#if $journeyStore.logs.length > 0}
				<div class="mt-4">
					<h3 class="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
						Recent Entries (Last 5)
					</h3>
					<div class="space-y-2">
						{#each $journeyStore.logs.slice(0, 5) as log (log.id)}
							<div
								class="rounded border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-600"
							>
								<div class="flex items-start justify-between">
									<div>
										<p class="font-medium text-slate-800 dark:text-slate-200">
											{new Date(log.date).toLocaleDateString()}
										</p>
										<p class="text-sm text-slate-600 dark:text-slate-400">
											{log.distance}
											{$journeyStore.unit}
											{#if log.note}
												- {log.note}
											{/if}
										</p>
									</div>
									<p class="text-xs text-slate-400">ID: {log.id}</p>
								</div>
							</div>
						{/each}
					</div>
					{#if $journeyStore.logs.length > 5}
						<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
							... and {$journeyStore.logs.length - 5} more entries
						</p>
					{/if}
				</div>
			{/if}
		</section>

		<!-- Data Export -->
		<section class="mb-8 space-y-4">
			<h2 class="font-serif text-3xl font-normal text-slate-800 dark:text-slate-100">
				Export Your Data
			</h2>
			<div class="space-y-3 text-slate-700 dark:text-slate-300">
				<p>
					<strong>Manual Backups & device transfer:</strong> For manually editing logs or moving
					data between devices, we recommend using the <strong>CSV Export</strong> feature found on
					the
					<a
						href={resolve('/logs')}
						class="font-semibold text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
						>Journey Logs</a
					> page.
				</p>
				<p>
					<strong>GDPR Data Download:</strong> The button below allows you to download all your stored
					data in JSON format. This format is provided to comply with GDPR regulations mandating full
					data access portability.
				</p>
			</div>
			<button
				onclick={downloadData}
				class="rounded-lg bg-ring-600 px-6 py-3 font-semibold text-white transition hover:bg-ring-700"
			>
				📥 Download Full Data (JSON)
			</button>
		</section>

		<!-- Privacy Policy Link -->
		<section class="mb-8">
			<a
				href={resolve('/privacy')}
				class="text-sm font-medium text-slate-500 hover:text-ring-600 hover:underline dark:text-ring-400 dark:hover:text-ring-300"
			>
				View Privacy Policy
			</a>
		</section>

		<!-- Data Management -->
		<section class="space-y-6">
			<h2 class="font-serif text-3xl font-normal text-slate-800 dark:text-slate-100">
				Data Management
			</h2>

			<!-- Clear Local Data -->
			{#if $storageMode !== 'cloud'}
				<div
					class="rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-700/50 dark:bg-yellow-900/20"
				>
					<h3 class="mb-2 text-lg font-semibold text-yellow-900 dark:text-yellow-300">
						Clear Local Data
					</h3>
					<p class="mb-4 text-sm text-yellow-800 dark:text-yellow-400">
						This removes journey data from this device.
					</p>
					{#if !showLocalDataConfirm}
						<button
							onclick={() => (showLocalDataConfirm = true)}
							class="rounded-lg border-2 border-yellow-600 bg-white px-4 py-2 font-semibold text-yellow-700 transition hover:bg-yellow-100 dark:bg-slate-700 dark:text-yellow-400 dark:hover:bg-slate-600"
						>
							Clear Local Data
						</button>
					{:else}
						<div class="space-y-3">
							<p class="font-medium text-yellow-900 dark:text-yellow-300">
								Are you sure? Type <code class="rounded bg-yellow-200 px-1 dark:bg-yellow-800/50"
									>CLEAR</code
								> to confirm:
							</p>
							<input
								type="text"
								bind:value={localDataConfirmText}
								placeholder="Type CLEAR"
								class="w-full max-w-xs rounded-lg border border-yellow-300 px-4 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none dark:border-yellow-600 dark:bg-slate-600 dark:text-slate-100"
							/>
							<div class="flex gap-3">
								<button
									onclick={handleClearLocalData}
									class="rounded-lg bg-yellow-600 px-4 py-2 font-semibold text-white transition hover:bg-yellow-700"
								>
									Confirm Clear
								</button>
								<button
									onclick={() => {
										showLocalDataConfirm = false;
										localDataConfirmText = '';
									}}
									class="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500"
								>
									Cancel
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Delete Account -->
			{#if $user}
				<div
					id="delete-account"
					class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-700/50 dark:bg-red-900/20"
				>
					<h3 class="mb-2 text-lg font-semibold text-red-900 dark:text-red-300">Delete Account</h3>
					<p class="mb-4 text-sm text-red-800 dark:text-red-400">
						This permanently deletes your account and associated cloud data. This action cannot be
						undone.
					</p>
					{#if !showDeleteConfirm}
						<button
							onclick={() => (showDeleteConfirm = true)}
							class="rounded-lg border-2 border-red-600 bg-white px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100 dark:bg-slate-700 dark:text-red-400 dark:hover:bg-slate-600"
						>
							Delete Account
						</button>
					{:else}
						<div class="space-y-3">
							<p class="font-medium text-red-900 dark:text-red-300">
								Are you absolutely sure? Type <code
									class="rounded bg-red-200 px-1 dark:bg-red-800/50">DELETE</code
								> to confirm:
							</p>
							<input
								type="text"
								bind:value={deleteConfirmText}
								placeholder="Type DELETE"
								class="w-full max-w-xs rounded-lg border border-red-300 px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none dark:border-red-600 dark:bg-slate-600 dark:text-slate-100"
							/>
							<div class="flex gap-3">
								<button
									onclick={handleDeleteAccount}
									class="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
								>
									Confirm Delete
								</button>
								<button
									onclick={() => {
										showDeleteConfirm = false;
										deleteConfirmText = '';
									}}
									class="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500"
								>
									Cancel
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else if $storageMode !== 'local'}
				<div
					class="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-600 dark:bg-slate-600"
				>
					<p class="text-slate-600 dark:text-slate-300">
						You need to be signed in to delete your account. Since you're not signed in, you can
						only clear your local data.
					</p>
				</div>
			{/if}
		</section>
	</div>
</div>
