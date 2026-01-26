<script lang="ts">
	import {
		auth,
		googleProvider,
		facebookProvider,
		microsoftProvider,
		appleProvider
	} from '$lib/firebase';
	import {
		signInWithPopup,
		createUserWithEmailAndPassword,
		signInWithEmailAndPassword,
		type AuthProvider
	} from 'firebase/auth';

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let mode = $state<'select' | 'email-signin' | 'email-signup'>('select');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleProviderSignIn(provider: AuthProvider, providerName: string) {
		loading = true;
		error = '';
		try {
			await signInWithPopup(auth, provider);
			onClose();
		} catch (e: unknown) {
			const err = e as { code?: string; message?: string };
			console.error(`${providerName} sign-in failed:`, e);
			error = err.message || `Failed to sign in with ${providerName}`;
		} finally {
			loading = false;
		}
	}

	async function handleEmailSignIn() {
		if (!email || !password) {
			error = 'Please enter email and password';
			return;
		}

		loading = true;
		error = '';
		try {
			await signInWithEmailAndPassword(auth, email, password);
			onClose();
		} catch (e: unknown) {
			const err = e as { code?: string; message?: string };
			console.error('Email sign-in failed:', e);
			if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
				error = 'Invalid email or password';
			} else {
				error = err.message || 'Failed to sign in';
			}
		} finally {
			loading = false;
		}
	}

	async function handleEmailSignUp() {
		if (!email || !password || !confirmPassword) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters';
			return;
		}

		loading = true;
		error = '';
		try {
			await createUserWithEmailAndPassword(auth, email, password);
			onClose();
		} catch (e: unknown) {
			const err = e as { code?: string; message?: string };
			console.error('Email sign-up failed:', e);
			if (err.code === 'auth/email-already-in-use') {
				error = 'Email already in use';
			} else if (err.code === 'auth/invalid-email') {
				error = 'Invalid email address';
			} else {
				error = err.message || 'Failed to create account';
			}
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		email = '';
		password = '';
		confirmPassword = '';
		error = '';
	}

	function switchMode(newMode: typeof mode) {
		mode = newMode;
		resetForm();
	}
</script>

<!-- Backdrop -->

<button
	type="button"
	class="bg-opacity-50 fixed inset-0 z-50 h-full w-full cursor-default border-none bg-black p-0"
	aria-label="Close modal"
	onclick={onClose}
></button>

<!-- Modal -->
<div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
	<div
		class="pointer-events-auto relative w-full max-w-md rounded-lg bg-white shadow-xl"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- Close button -->
		<button
			onclick={onClose}
			class="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
			aria-label="Close"
		>
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>

		<div class="p-6">
			{#if mode === 'select'}
				<h2 class="mb-6 font-serif text-2xl font-bold text-slate-800">Sign In</h2>

				<div class="space-y-3">
					<!-- Google -->
					<button
						onclick={() => handleProviderSignIn(googleProvider, 'Google')}
						disabled={loading}
						class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Continue with Google
					</button>

					<!-- Facebook -->
					<button
						onclick={() => handleProviderSignIn(facebookProvider, 'Facebook')}
						disabled={loading}
						class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
					>
						<svg class="h-5 w-5" fill="#1877F2" viewBox="0 0 24 24">
							<path
								d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
							/>
						</svg>
						Continue with Facebook
					</button>

					<!-- Microsoft -->
					<button
						onclick={() => handleProviderSignIn(microsoftProvider, 'Microsoft')}
						disabled={loading}
						class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24">
							<path fill="#F25022" d="M0 0h11.377v11.372H0z" />
							<path fill="#00A4EF" d="M12.623 0H24v11.372H12.623z" />
							<path fill="#7FBA00" d="M0 12.623h11.377V24H0z" />
							<path fill="#FFB900" d="M12.623 12.623H24V24H12.623z" />
						</svg>
						Continue with Microsoft
					</button>

					<!-- Apple -->
					<button
						onclick={() => handleProviderSignIn(appleProvider, 'Apple')}
						disabled={loading}
						class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
					>
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
							/>
						</svg>
						Continue with Apple
					</button>

					<div class="relative my-6">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-slate-300"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="bg-white px-2 text-slate-500">Or</span>
						</div>
					</div>

					<!-- Email options -->
					<button
						onclick={() => switchMode('email-signin')}
						class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
					>
						Sign in with Email
					</button>

					<button
						onclick={() => switchMode('email-signup')}
						class="w-full rounded-lg bg-pumpkin-600 px-4 py-3 font-medium text-white transition hover:bg-pumpkin-700"
					>
						Create Account with Email
					</button>
				</div>
			{:else if mode === 'email-signin'}
				<h2 class="mb-6 font-serif text-2xl font-bold text-slate-800">Sign In with Email</h2>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleEmailSignIn();
					}}
					class="space-y-4"
				>
					<div>
						<label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-pumpkin-500 focus:ring-2 focus:ring-pumpkin-200 focus:outline-none"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label for="password" class="mb-1 block text-sm font-medium text-slate-700"
							>Password</label
						>
						<input
							id="password"
							type="password"
							bind:value={password}
							required
							class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-pumpkin-500 focus:ring-2 focus:ring-pumpkin-200 focus:outline-none"
							placeholder="••••••••"
						/>
					</div>

					{#if error}
						<div class="rounded-lg bg-red-50 p-3 text-sm text-red-600">
							{error}
						</div>
					{/if}

					<button
						type="submit"
						disabled={loading}
						class="w-full rounded-lg bg-pumpkin-600 px-4 py-3 font-medium text-white transition hover:bg-pumpkin-700 disabled:opacity-50"
					>
						{loading ? 'Signing in...' : 'Sign In'}
					</button>

					<button
						type="button"
						onclick={() => switchMode('select')}
						class="w-full text-sm text-slate-600 hover:text-slate-800"
					>
						← Back to all options
					</button>
				</form>
			{:else if mode === 'email-signup'}
				<h2 class="mb-6 font-serif text-2xl font-bold text-slate-800">Create Account</h2>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleEmailSignUp();
					}}
					class="space-y-4"
				>
					<div>
						<label for="signup-email" class="mb-1 block text-sm font-medium text-slate-700"
							>Email</label
						>
						<input
							id="signup-email"
							type="email"
							bind:value={email}
							required
							class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-pumpkin-500 focus:ring-2 focus:ring-pumpkin-200 focus:outline-none"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label for="signup-password" class="mb-1 block text-sm font-medium text-slate-700"
							>Password</label
						>
						<input
							id="signup-password"
							type="password"
							bind:value={password}
							required
							minlength="6"
							class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-pumpkin-500 focus:ring-2 focus:ring-pumpkin-200 focus:outline-none"
							placeholder="••••••••"
						/>
						<p class="mt-1 text-xs text-slate-500">At least 6 characters</p>
					</div>

					<div>
						<label for="confirm-password" class="mb-1 block text-sm font-medium text-slate-700"
							>Confirm Password</label
						>
						<input
							id="confirm-password"
							type="password"
							bind:value={confirmPassword}
							required
							minlength="6"
							class="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-pumpkin-500 focus:ring-2 focus:ring-pumpkin-200 focus:outline-none"
							placeholder="••••••••"
						/>
					</div>

					{#if error}
						<div class="rounded-lg bg-red-50 p-3 text-sm text-red-600">
							{error}
						</div>
					{/if}

					<button
						type="submit"
						disabled={loading}
						class="w-full rounded-lg bg-pumpkin-600 px-4 py-3 font-medium text-white transition hover:bg-pumpkin-700 disabled:opacity-50"
					>
						{loading ? 'Creating account...' : 'Create Account'}
					</button>

					<button
						type="button"
						onclick={() => switchMode('select')}
						class="w-full text-sm text-slate-600 hover:text-slate-800"
					>
						← Back to all options
					</button>
				</form>
			{/if}
		</div>
	</div>
</div>
