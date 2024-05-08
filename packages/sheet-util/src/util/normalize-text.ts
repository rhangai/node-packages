// Normalize a text to load
export function normalizeText(key: string): string {
	return key
		.normalize('NFD')
		.replace(/[^a-zA-Z0-9]/g, '')
		.toLowerCase();
}
