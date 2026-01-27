// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

declare global {
	interface BeforeInstallPromptEvent extends Event {
		readonly platforms: string[];
		readonly userChoice: Promise<{
			outcome: 'accepted' | 'dismissed';
			platform: string;
		}>;
		prompt(): Promise<void>;
	}

	interface WindowEventMap {
		beforeinstallprompt: BeforeInstallPromptEvent;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}
