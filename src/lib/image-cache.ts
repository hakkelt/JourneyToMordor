import { LOCATIONS } from './data';
import type { Picture } from 'vite-imagetools';

const AVIF_TEST =
	'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAA' +
	'AAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAImlsb2MAAAAAREAAAQA' +
	'BAAAAAAD6AAEAAAAAAAAAGgAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAVmlwcnAAAAA4aXB' +
	'jbwAAAAxhdjFDgQAMAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAE' +
	'AAQOBAgMAAAAibWRhdBIACggYAAYICGg0IDIMFMAEEEEEAAB5S61W';
const WEBP_TEST = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';

// Define explicit types to satisfy linting
type IdleRequestCallback = (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void;

interface ExtendedWindow extends Window {
	requestIdleCallback: (callback: IdleRequestCallback) => number;
}

interface ExtendedRequestInit extends RequestInit {
	priority?: 'high' | 'low' | 'auto';
}

type ImageSource = string | { src: string; w?: string | number };

async function checkSupport(dataUri: string): Promise<boolean> {
	if (typeof Image === 'undefined') return false;
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
		img.src = dataUri;
	});
}

function parseSrcset(srcset: string): { url: string; w: number }[] {
	return srcset
		.split(',')
		.map((part) => {
			const trimmed = part.trim();
			const match = trimmed.match(/^(.+?)(?:\s+(\d+)w)?$/);
			if (match) {
				const url = match[1];
				const w = match[2] ? parseInt(match[2], 10) : Infinity;
				return { url, w };
			}
			return null;
		})
		.filter((x): x is { url: string; w: number } => x !== null);
}

export async function warmImageCache() {
	if (typeof window === 'undefined') return;

	// Use requestIdleCallback if available, otherwise delayed timeout
	const run = () => process();
	if ('requestIdleCallback' in window) {
		(window as unknown as ExtendedWindow).requestIdleCallback(run);
	} else {
		setTimeout(run, 3000);
	}
}

async function process() {
	const avif = await checkSupport(AVIF_TEST);
	const webp = await checkSupport(WEBP_TEST);

	const urls = new Set<string>();

	for (const loc of LOCATIONS) {
		const img = loc.image;
		if (!img) continue;

		if (typeof img === 'string') {
			urls.add(img);
			continue;
		}

		// Handle enhanced-img Picture object
		const pic = img as Picture;
		let chosenSources: ImageSource[] = [];

		if (avif && pic.sources?.avif) {
			chosenSources = Array.isArray(pic.sources.avif) ? pic.sources.avif : [pic.sources.avif];
		} else if (webp && pic.sources?.webp) {
			chosenSources = Array.isArray(pic.sources.webp) ? pic.sources.webp : [pic.sources.webp];
		} else if (pic.img) {
			chosenSources = [pic.img];
		}

		// Normalize candidates
		const candidates: { url: string; w: number }[] = [];

		for (const entry of chosenSources) {
			const rawSrc = typeof entry === 'string' ? entry : entry.src;
			const w =
				typeof entry === 'object' && 'w' in entry ? parseInt(String(entry.w), 10) : Infinity;

			if (rawSrc) {
				// Check if it's a srcset string
				if (rawSrc.includes(',')) {
					candidates.push(...parseSrcset(rawSrc));
				} else {
					// Single URL
					candidates.push({ url: rawSrc, w: isNaN(w) ? Infinity : w });
				}
			}
		}

		// Select the largest candidate
		if (candidates.length > 0) {
			// Sort by width ascending
			candidates.sort((a, b) => a.w - b.w);

			// Always pick the largest (last one) - Safer for offline quality
			const best = candidates[candidates.length - 1];

			if (best) {
				urls.add(best.url);
			}
		}
	}

	// Fetch assets to populate the runtime cache
	for (const url of urls) {
		try {
			await fetch(url, { priority: 'low' } as ExtendedRequestInit);
		} catch {
			// Ignore errors
		}
	}
}
