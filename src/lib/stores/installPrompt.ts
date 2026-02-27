import { writable } from 'svelte/store';

export interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void> | void;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const installPromptEvent = writable<BeforeInstallPromptEvent | null>(null);
