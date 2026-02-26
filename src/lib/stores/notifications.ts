import { writable } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationMessage {
	id: number;
	type: NotificationType;
	message: string;
}

export const notifications = writable<NotificationMessage[]>([]);

export function notify(type: NotificationType, message: string, timeoutMs = 3500): void {
	const item: NotificationMessage = {
		id: Date.now() + Math.floor(Math.random() * 1000),
		type,
		message
	};

	notifications.update((items) => [...items, item]);

	setTimeout(() => {
		notifications.update((items) => items.filter((existing) => existing.id !== item.id));
	}, timeoutMs);
}

export function dismissNotification(id: number): void {
	notifications.update((items) => items.filter((item) => item.id !== id));
}
