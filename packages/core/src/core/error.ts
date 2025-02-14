/**
 * Error to be throw as an http generic error
 */
export interface IToHttpException {
	/**
	 * Convert the error to an http response
	 */
	toHttp(): Record<string, unknown> & { message: string };
}

/**
 * Has a public message
 */
export interface IPublicMessageException {
	/**
	 * Get a public error message
	 */
	getPublicErrorMessage(): string;
}

/**
 * A simple error with an attached error code
 */
export class ErrorCode extends Error {
	constructor(
		public readonly errorCode: string,
		message: string,
		public readonly errorValue?: unknown,
	) {
		super(message);
	}
}

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
		const maybeError = errorParam as { getPublicErrorMessage?: () => unknown };
		if (typeof maybeError.getPublicErrorMessage === 'function') {
			const publicMessage = maybeError.getPublicErrorMessage();
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
