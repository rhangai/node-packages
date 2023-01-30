/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Util function to catch unreachable code
 */
export function unreachable(input: never, error?: string): never {
	throw new Error(error ? `Should be unreachable. ${error}` : 'Should be unreachable');
}

/**
 * Ignore unreachable code
 */
export function unreachableIgnore(input: never): void {
	/* Does nothing */
}
