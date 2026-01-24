import type { LogEntry } from './storage';

const KM_TO_MILES = 0.621371;

/**
 * Converts log entries to CSV format
 * @param logs - Array of log entries
 * @param unit - Unit to use for distance ('km' or 'miles')
 * @returns CSV string
 */
export function convertToCSV(logs: LogEntry[], unit: 'km' | 'miles' = 'km'): string {
	// CSV Header
	const headers = ['Date', `Distance (${unit})`, 'Note'];
	const rows = [headers.join(',')];

	// Sort logs by date (oldest first)
	const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));

	// Add data rows
	for (const log of sortedLogs) {
		const distance =
			unit === 'miles' ? (log.distance * KM_TO_MILES).toFixed(2) : log.distance.toFixed(2);
		const note = log.note ? `"${log.note.replace(/"/g, '""')}"` : ''; // Escape quotes in notes
		rows.push([log.date, distance, note].join(','));
	}

	return rows.join('\n');
}

/**
 * Triggers a download of the CSV file
 * @param csvContent - CSV string content
 * @param filename - Name of the file to download
 */
export function downloadCSV(csvContent: string, filename: string = 'journey-log.csv'): void {
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Clean up the URL object
	URL.revokeObjectURL(url);
}

/**
 * Splits a CSV line into fields, handling quoted strings correctly.
 * Example: 'a,"b,c",d' -> ['a', 'b,c', 'd']
 */
function splitCSVLine(line: string): string[] {
	const result: string[] = [];
	let start = 0;
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		if (line[i] === '"') {
			inQuotes = !inQuotes;
		} else if (line[i] === ',' && !inQuotes) {
			result.push(stripQuotes(line.substring(start, i)));
			start = i + 1;
		}
	}
	result.push(stripQuotes(line.substring(start)));
	return result;
}

function stripQuotes(text: string): string {
	const trimmed = text.trim();
	if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
		// Remove surrounding quotes and unescape double quotes ("" -> ")
		return trimmed.slice(1, -1).replace(/""/g, '"');
	}
	return trimmed;
}

/**
 * Parses CSV content into LogEntry array.
 * Validates format and converts units if necessary.
 */
export function parseCSV(content: string): LogEntry[] {
	const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
	if (lines.length < 2) {
		throw new Error('CSV file is empty or missing headers');
	}

	const headerLine = lines[0].toLowerCase();
	const headers = splitCSVLine(headerLine);

	// Validate headers
	const dateIndex = headers.findIndex((h) => h.includes('date'));
	const distanceIndex = headers.findIndex((h) => h.includes('distance'));
	const noteIndex = headers.findIndex((h) => h.includes('note'));

	if (dateIndex === -1 || distanceIndex === -1) {
		throw new Error('Missing required columns: Date and Distance');
	}

	// Check for unit in distance header
	const isMiles = headers[distanceIndex].includes('miles');
	const MILES_TO_KM = 1.60934;

	const logs: LogEntry[] = [];

	// Parse data rows
	for (let i = 1; i < lines.length; i++) {
		const line = lines[i];
		const fields = splitCSVLine(line);

		if (fields.length < 2) continue; // Skip malformed lines

		const dateStr = fields[dateIndex];
		const distStr = fields[distanceIndex];
		const note = noteIndex !== -1 ? fields[noteIndex] : '';

		// Validate Date (YYYY-MM-DD or similar) - minimal check
		// If it's not a valid date, skipping might be safer or throwing.
		// Let's assume standard YYYY-MM-DD for now as that's what we export.
		if (!dateStr || isNaN(Date.parse(dateStr))) {
			throw new Error(`Invalid date on line ${i + 1}: ${dateStr}`);
		}

		let distance = parseFloat(distStr);
		if (isNaN(distance) || distance < 0) {
			throw new Error(`Invalid distance on line ${i + 1}: ${distStr}`);
		}

		if (isMiles) {
			distance = distance * MILES_TO_KM;
		}

		logs.push({
			id: Date.now() + i, // Generate unique IDs
			date: dateStr,
			distance,
			note: note || undefined
		});
	}

	return logs;
}
