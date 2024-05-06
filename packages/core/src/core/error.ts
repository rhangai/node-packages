/**
 * Get an error message
 */
export function errorMessage(errorParam: unknown): string | undefined {
	let message: string | undefined;
	if (errorParam == null) {
		return undefined;
	} else if (typeof errorParam === 'string') {
		message = errorParam;
	} else if (typeof errorParam === 'object') {
		const error = errorParam as { message?: string; error?: string };
		if (error instanceof Error || typeof error.message === 'string') {
			message = error.message;
		} else if (typeof error.error === 'string') {
			message = error.error;
		}
	}
	if (!message) {
		return undefined;
	}
	return message;
}

/**
 * Get an error message with a prefix
 */
export function errorMessageWithPrefix(errorParam: unknown, prefixMessage: string): string {
	const message = errorMessage(errorParam);
	if (!message) {
		return prefixMessage;
	} else if (!prefixMessage) {
		return message;
	}
	return `${prefixMessage}: ${message}`;
}
