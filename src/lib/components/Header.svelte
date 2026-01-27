<script lang="ts">
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import headerLogo from '$lib/assets/header-40.png?enhanced';
	import { journeyStore, setUnit } from '$lib/storage';
	import { user } from '$lib/stores/auth';
	import Auth from './Auth.svelte';

	function handleSetUnit(unit: 'km' | 'miles') {
		setUnit(unit, $user);
	}
</script>

<header class="sticky top-0 z-50 bg-earth-900 text-slate-200 shadow-md">
	<div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
		<div class="flex items-center gap-6">
			<a href={resolve('/')} class="flex items-center gap-3 transition-opacity hover:opacity-80">
				<enhanced:img
					src={headerLogo}
					alt="The One Ring"
					class="h-10 w-10 drop-shadow-lg"
					width="40"
					height="40"
				/>
				<span class="font-display text-xl font-normal tracking-wide text-ring-400 md:text-4xl">
					Journey to Mordor
				</span>
			</a>

			<!-- Desktop Navigation -->
			<nav class="hidden items-center gap-2 md:flex">
				<a
					href={resolve('/')}
					class="rounded-full px-4 py-1.5 text-sm font-medium transition-all {$page.url.pathname ===
					resolve('/')
						? 'bg-ring-600/20 text-ring-400'
						: 'text-slate-400 hover:bg-earth-800 hover:text-slate-200'}"
				>
					Dashboard
				</a>
				<a
					href={resolve('/logs')}
					class="rounded-full px-4 py-1.5 text-sm font-medium transition-all {$page.url.pathname.startsWith(
						resolve('/logs')
					)
						? 'bg-ring-600/20 text-ring-400'
						: 'text-slate-400 hover:bg-earth-800 hover:text-slate-200'}"
				>
					Logs
				</a>
				<a
					href={resolve('/my-data')}
					class="rounded-full px-4 py-1.5 text-sm font-medium transition-all {$page.url.pathname.startsWith(
						resolve('/my-data')
					)
						? 'bg-ring-600/20 text-ring-400'
						: 'text-slate-400 hover:bg-earth-800 hover:text-slate-200'}"
				>
					My Data
				</a>
			</nav>
		</div>

		<div class="flex items-center gap-4">
			<!-- Mobile Navigation Links (Icons or compact version) -->
			<!-- For now just showing actions -->

			<div class="flex items-center gap-3">
				<!-- Unit Selector (MD3 Segmented Button style) -->
				<div class="flex h-8 items-center rounded-lg border border-earth-700 bg-earth-800 p-0.5">
					<button
						class="flex h-full items-center rounded-md px-3 text-xs font-semibold transition-all {$journeyStore.unit ===
						'km'
							? 'bg-ring-600 text-white shadow-sm'
							: 'text-slate-400 hover:text-slate-200'}"
						onclick={() => handleSetUnit('km')}
						aria-label="Set units to kilometers"
						aria-pressed={$journeyStore.unit === 'km'}
					>
						km
					</button>
					<button
						class="flex h-full items-center rounded-md px-3 text-xs font-semibold transition-all {$journeyStore.unit ===
						'miles'
							? 'bg-ring-600 text-white shadow-sm'
							: 'text-slate-400 hover:text-slate-200'}"
						onclick={() => handleSetUnit('miles')}
						aria-label="Set units to miles"
						aria-pressed={$journeyStore.unit === 'miles'}
					>
						miles
					</button>
				</div>

				<div class="hidden h-6 w-px bg-earth-700 sm:block"></div>

				<Auth />
			</div>
		</div>
	</div>

	<!-- Mobile Navigation Bar (MD3-style compact) -->
	<nav class="flex h-12 border-t border-earth-800 bg-earth-900 md:hidden">
		<a
			href={resolve('/')}
			class="flex flex-1 items-center justify-center text-xs font-medium transition-all {$page.url
				.pathname === resolve('/')
				? 'text-ring-400'
				: 'text-slate-400'}"
		>
			<span class="flex flex-col items-center">
				<span
					class="mb-1 h-1 w-8 rounded-full {$page.url.pathname === resolve('/')
						? 'bg-ring-400'
						: 'bg-transparent'}"
				></span>
				Dashboard
			</span>
		</a>
		<a
			href={resolve('/logs')}
			class="flex flex-1 items-center justify-center text-xs font-medium transition-all {$page.url.pathname.startsWith(
				resolve('/logs')
			)
				? 'text-ring-400'
				: 'text-slate-400'}"
		>
			<span class="flex flex-col items-center">
				<span
					class="mb-1 h-1 w-8 rounded-full {$page.url.pathname.startsWith(resolve('/logs'))
						? 'bg-ring-400'
						: 'bg-transparent'}"
				></span>
				Logs
			</span>
		</a>
		<a
			href={resolve('/my-data')}
			class="flex flex-1 items-center justify-center text-xs font-medium transition-all {$page.url.pathname.startsWith(
				resolve('/my-data')
			)
				? 'text-ring-400'
				: 'text-slate-400'}"
		>
			<span class="flex flex-col items-center">
				<span
					class="mb-1 h-1 w-8 rounded-full {$page.url.pathname.startsWith(resolve('/my-data'))
						? 'bg-ring-400'
						: 'bg-transparent'}"
				></span>
				My Data
			</span>
		</a>
	</nav>
</header>
