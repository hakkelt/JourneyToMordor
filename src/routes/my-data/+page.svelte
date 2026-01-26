<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/auth';
	import { journeyStore, resetData, deleteUserAccount } from '$lib/storage';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let showDeleteConfirm = $state(false);
	let showLocalDataConfirm = $state(false);
	let deleteConfirmText = $state('');
	let localDataConfirmText = $state('');

	onMount(() => {
		window.scrollTo(0, 0);
	});

	async function handleDeleteAccount() {
		if (!$user) return;

		if (deleteConfirmText !== 'DELETE') {
			alert('Please type DELETE to confirm');
			return;
		}

		try {
			await deleteUserAccount($user);
			alert('Account deleted successfully. Your local data has also been cleared.');
			showDeleteConfirm = false;
			goto(resolve('/'));
		} catch (e: unknown) {
			const error = e as { code?: string };
			if (error.code === 'auth/requires-recent-login') {
				alert(
					'For security reasons, this operation requires a recent login. Please sign out and sign in again before deleting your account.'
				);
			} else {
				alert('Failed to delete account. Please try again later.');
				console.error(e);
			}
		}
	}

	function handleClearLocalData() {
		if (localDataConfirmText !== 'CLEAR') {
			alert('Please type CLEAR to confirm');
			return;
		}

		resetData();
		alert('Local data cleared successfully.');
		showLocalDataConfirm = false;
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
</script>

<svelte:head>
	<title>My Data - Journey To Mordor</title>
	<meta name="description" content="View and manage your Journey To Mordor data" />
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<div class="rounded-lg bg-white p-8 shadow-md">
		<h1 class="mb-6 font-serif text-4xl font-bold text-slate-800">My Data</h1>

		<!-- Account Information -->
		<section class="mb-8 space-y-4">
			<h2 class="font-serif text-2xl font-semibold text-slate-800">Account Information</h2>
			{#if $user}
				<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
					<div class="space-y-2">
						<div class="flex items-start justify-between">
							<div>
								<p class="text-sm font-medium text-slate-600">User ID</p>
								<p class="font-mono text-sm text-slate-800">{$user.uid}</p>
							</div>
						</div>
						{#if $user.email}
							<div>
								<p class="text-sm font-medium text-slate-600">Email</p>
								<p class="text-slate-800">{$user.email}</p>
							</div>
						{/if}
						{#if $user.displayName}
							<div>
								<p class="text-sm font-medium text-slate-600">Display Name</p>
								<p class="text-slate-800">{$user.displayName}</p>
							</div>
						{/if}
						<div>
							<p class="text-sm font-medium text-slate-600">Email Verified</p>
							<p class="text-slate-800">{$user.emailVerified ? 'Yes' : 'No'}</p>
						</div>
					</div>
				</div>
			{:else}
				<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
					<p class="text-blue-800">
						You are not signed in. Your data is stored locally in your browser only.
					</p>
				</div>
			{/if}
		</section>

		<!-- Journey Data -->
		<section class="mb-8 space-y-4">
			<h2 class="font-serif text-2xl font-semibold text-slate-800">Journey Data</h2>
			<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
				<div class="space-y-3">
					<div>
						<p class="text-sm font-medium text-slate-600">Total Log Entries</p>
						<p class="text-2xl font-bold text-slate-800">{$journeyStore.logs.length}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-600">Unit Preference</p>
						<p class="text-slate-800">{$journeyStore.unit === 'km' ? 'Kilometers' : 'Miles'}</p>
					</div>
					<div>
						<p class="text-sm font-medium text-slate-600">Total Distance</p>
						<p class="text-slate-800">
							{$journeyStore.logs.reduce((sum, log) => sum + log.distance, 0).toFixed(1)}
							{$journeyStore.unit}
						</p>
					</div>
					{#if $journeyStore.logs.length > 0}
						<div>
							<p class="text-sm font-medium text-slate-600">Date Range</p>
							<p class="text-slate-800">
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
					<h3 class="mb-2 text-lg font-semibold text-slate-800">Recent Entries (Last 5)</h3>
					<div class="space-y-2">
						{#each $journeyStore.logs.slice(0, 5) as log (log.id)}
							<div class="rounded border border-slate-200 bg-white p-3">
								<div class="flex items-start justify-between">
									<div>
										<p class="font-medium text-slate-800">
											{new Date(log.date).toLocaleDateString()}
										</p>
										<p class="text-sm text-slate-600">
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
						<p class="mt-2 text-sm text-slate-500">
							... and {$journeyStore.logs.length - 5} more entries
						</p>
					{/if}
				</div>
			{/if}
		</section>

		<!-- Data Export -->
		<section class="mb-8 space-y-4">
			<h2 class="font-serif text-2xl font-semibold text-slate-800">Export Your Data</h2>
			<div class="space-y-3 text-slate-700">
				<p>
					<strong>Manual Backups & device transfer:</strong> For manually editing logs or moving
					data between devices, we recommend using the <strong>CSV Export</strong> feature found on
					the
					<a href={resolve('/logs')} class="font-semibold text-pumpkin-600 hover:underline"
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
				class="rounded-lg bg-pumpkin-600 px-6 py-3 font-semibold text-white transition hover:bg-pumpkin-700"
			>
				📥 Download Full Data (JSON)
			</button>
		</section>

		<!-- Privacy Policy Link -->
		<section class="mb-8">
			<a
				href={resolve('/privacy')}
				class="text-sm font-medium text-slate-500 hover:text-pumpkin-600 hover:underline"
			>
				View Privacy Policy
			</a>
		</section>

		<!-- Data Management -->
		<section class="space-y-6">
			<h2 class="font-serif text-2xl font-semibold text-slate-800">Data Management</h2>

			<!-- Clear Local Data -->
			<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
				<h3 class="mb-2 text-lg font-semibold text-yellow-900">Clear Local Data</h3>
				<p class="mb-4 text-sm text-yellow-800">
					This will remove all journey data from your browser's local storage. If you're signed in,
					your cloud data will remain intact and will re-sync when you reload the page.
				</p>
				{#if !showLocalDataConfirm}
					<button
						onclick={() => (showLocalDataConfirm = true)}
						class="rounded-lg border-2 border-yellow-600 bg-white px-4 py-2 font-semibold text-yellow-700 transition hover:bg-yellow-100"
					>
						Clear Local Data
					</button>
				{:else}
					<div class="space-y-3">
						<p class="font-medium text-yellow-900">
							Are you sure? Type <code class="rounded bg-yellow-200 px-1">CLEAR</code> to confirm:
						</p>
						<input
							type="text"
							bind:value={localDataConfirmText}
							placeholder="Type CLEAR"
							class="w-full max-w-xs rounded-lg border border-yellow-300 px-4 py-2 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
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
								class="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
							>
								Cancel
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Delete Account -->
			{#if $user}
				<div id="delete-account" class="rounded-lg border border-red-200 bg-red-50 p-6">
					<h3 class="mb-2 text-lg font-semibold text-red-900">Delete Account</h3>
					<p class="mb-4 text-sm text-red-800">
						This will permanently delete your account and all associated cloud data. Your local data
						will also be cleared. This action cannot be undone.
					</p>
					{#if !showDeleteConfirm}
						<button
							onclick={() => (showDeleteConfirm = true)}
							class="rounded-lg border-2 border-red-600 bg-white px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100"
						>
							Delete Account
						</button>
					{:else}
						<div class="space-y-3">
							<p class="font-medium text-red-900">
								Are you absolutely sure? Type <code class="rounded bg-red-200 px-1">DELETE</code> to confirm:
							</p>
							<input
								type="text"
								bind:value={deleteConfirmText}
								placeholder="Type DELETE"
								class="w-full max-w-xs rounded-lg border border-red-300 px-4 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none"
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
									class="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
								>
									Cancel
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="rounded-lg border border-slate-200 bg-slate-50 p-6">
					<p class="text-slate-600">
						You need to be signed in to delete your account. Since you're not signed in, you can
						only clear your local data.
					</p>
				</div>
			{/if}
		</section>

		<!-- Back Link -->
		<div class="mt-8 border-t border-slate-200 pt-6">
			<a
				href={resolve('/')}
				class="inline-block rounded-lg bg-slate-600 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
			>
				← Back to Journey
			</a>
		</div>
	</div>
</div>
