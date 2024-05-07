/**
 * Get an error message
 */
export function errorPublicMessage(errorParam: unknown): string | undefined {
	let message: string | undefined;
	if (errorParam == null) {
		return undefined;
	} else if (typeof errorParam === 'string') {
		message = errorParam;
	} else if (typeof errorParam === 'object') {
		const maybeError = errorParam as { getPublicMessage?: () => unknown };
		if (typeof maybeError.getPublicMessage === 'function') {
			const publicMessage = maybeError.getPublicMessage();
			if (typeof publicMessage === 'string') {
				message = publicMessage;
			}
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
export function errorPublicMessageWithPrefix(errorParam: unknown, prefixMessage: string): string {
	const message = errorPublicMessage(errorParam);
	if (!message) {
		return prefixMessage;
	} else if (!prefixMessage) {
		return message;
	}
	return `${prefixMessage}: ${message}`;
}
