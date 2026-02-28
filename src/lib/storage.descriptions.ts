/**
 * Storage mode description texts shared between UI components and e2e tests.
 * This file must have no imports so Playwright can import it directly.
 */

export const LOCAL_MODE_DESC_LINE1 =
	'No sign-in, all data stored locally on this device. Data will not sync between devices and can be lost if browser data is cleared.';
export const LOCAL_MODE_DESC_LINE2 =
	'Recommended for users who want to keep their data private and only use one device.';
export const CLOUD_MODE_DESC_BROWSER =
	'All data kept in cloud, except when the device goes offline. It allows synchronization between devices, and requires Sign-in.';
export const CLOUD_MODE_DESC_INSTALLED =
	'Data kept in cloud and on this device (tied to your account). Allows synchronization between devices, requires Sign-in.';
export const CLOUD_MODE_DESC_INSTALLED_DETAILED =
	'Data kept in cloud and on this device (tied to your account; discarded on sign-out). Allows synchronization between devices, requires Sign-in.';
export const CLOUD_MODE_DESC_LINE2 =
	"Recommended for users who want to access their data across multiple devices and don't mind signing in.";
