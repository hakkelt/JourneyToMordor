import { LOCATIONS } from './data';
import type { Picture } from 'vite-imagetools';
import headerLogo from '$lib/assets/header.png?enhanced';
import whereAreWeGoing from '$lib/assets/where-are-we-going.jpg?enhanced';

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
type CacheImageInput = string | Picture;

const GOOGLE_FONTS_STYLESHEET_URL =
	'https://fonts.googleapis.com/css2?family=Bilbo+Swash+Caps&family=Cinzel:wght@400;700&family=Lato:wght@400;700&display=swap';

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

export async function warmFontCaches() {
	if (typeof window === 'undefined' || !('caches' in window)) return;

	try {
		const stylesheetResponse = await fetch(GOOGLE_FONTS_STYLESHEET_URL, {
			priority: 'low'
		} as ExtendedRequestInit);

		if (!stylesheetResponse.ok) return;

		const stylesheetText = await stylesheetResponse.clone().text();
		const stylesheetCache = await caches.open('google-fonts-cache');
		await stylesheetCache.put(GOOGLE_FONTS_STYLESHEET_URL, stylesheetResponse.clone());

		const fontUrlMatches = [...stylesheetText.matchAll(/url\(([^)]+)\)/g)];
		const fontUrls = fontUrlMatches
			.map((match) => match[1]?.trim().replace(/^['"]|['"]$/g, ''))
			.filter((url): url is string => Boolean(url));

		const fontCache = await caches.open('gstatic-fonts-cache');

		for (const fontUrl of fontUrls) {
			try {
				const fontResponse = await fetch(fontUrl, { priority: 'low' } as ExtendedRequestInit);
				if (fontResponse.ok) {
					await fontCache.put(fontUrl, fontResponse.clone());
				}
			} catch {
				// Ignore errors
			}
		}
	} catch {
		// Ignore errors
	}
}

function chooseSourcesForBrowser(pic: Picture, avif: boolean, webp: boolean): ImageSource[] {
	if (avif && pic.sources?.avif) {
		return Array.isArray(pic.sources.avif) ? pic.sources.avif : [pic.sources.avif];
	}

	if (webp && pic.sources?.webp) {
		return Array.isArray(pic.sources.webp) ? pic.sources.webp : [pic.sources.webp];
	}

	if (pic.img) {
		return [pic.img];
	}

	return [];
}

function selectMinimalSrcsetUrls(candidates: { url: string; w: number }[]): string[] {
	if (candidates.length === 0) return [];

	const finiteCandidates = candidates.filter((candidate) => Number.isFinite(candidate.w));
	if (finiteCandidates.length === 0) {
		return [candidates[0].url];
	}

	const sorted = [...finiteCandidates].sort((a, b) => a.w - b.w);
	const targetWidths = [480, 960, 1600];
	const selected = new Set<string>();

	for (const targetWidth of targetWidths) {
		const best =
			sorted.find((candidate) => candidate.w >= targetWidth) ?? sorted[sorted.length - 1];
		if (best) {
			selected.add(best.url);
		}
	}

	return [...selected];
}

function getUrlsToWarm(image: CacheImageInput, avif: boolean, webp: boolean): string[] {
	if (typeof image === 'string') {
		return [image];
	}

	const pic = image as Picture;
	const chosenSources = chooseSourcesForBrowser(pic, avif, webp);
	const urls = new Set<string>();

	for (const entry of chosenSources) {
		const rawSrc = typeof entry === 'string' ? entry : entry.src;
		if (!rawSrc) continue;

		if (rawSrc.includes(',')) {
			for (const url of selectMinimalSrcsetUrls(parseSrcset(rawSrc))) {
				urls.add(url);
			}
		} else {
			urls.add(rawSrc);
		}
	}

	return [...urls];
}

async function process() {
	const avif = await checkSupport(AVIF_TEST);
	const webp = await checkSupport(WEBP_TEST);

	const urls = new Set<string>();

	for (const loc of LOCATIONS) {
		const img = loc.image;
		if (!img) continue;

		for (const url of getUrlsToWarm(img, avif, webp)) {
			urls.add(url);
		}
	}

	for (const url of getUrlsToWarm(headerLogo as Picture, avif, webp)) {
		urls.add(url);
	}

	for (const url of getUrlsToWarm(whereAreWeGoing as Picture, avif, webp)) {
		urls.add(url);
	}

	// Fetch assets to populate the runtime cache
	for (const url of urls) {
		try {
			const response = await fetch(url, { priority: 'low' } as ExtendedRequestInit);

			if ('caches' in window && response.ok) {
				const imageCache = await caches.open('images');
				await imageCache.put(url, response.clone());
			}
		} catch {
			// Ignore errors
		}
	}
}
