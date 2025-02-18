/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Utililty error class
 */
export class UnreachableError extends Error {
	constructor(input: never, error?: string) {
		super(error ? `Should be unreachable. ${error}` : 'Should be unreachable');
	}
}

/**
 * Util function to catch unreachable code
 */
export function unreachable(input: never, error?: string): never {
	throw new UnreachableError(input, error);
}

/**
 * Ignore unreachable code
 */
export function unreachableIgnore(input: never): void {
	/* Does nothing */
}
