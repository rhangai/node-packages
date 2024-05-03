/**
 * Error to be throw as an http generic error
 */
export interface ToHttpException {
	/**
	 * Convert the error to an http response
	 */
	toHttp(): Record<string, unknown> & { message: string };
}

/**
 * A public error
 */
export class PublicHttpError extends Error implements ToHttpException {
	/**
	 * Error message
	 */
	constructor(
		message?: string,
		private readonly httpData?: Record<string, unknown>,
	) {
		super(message);
	}

	/**
	 * Public error message
	 */
	getPublicErrorMessage() {
		return this.message;
	}

	/**
	 * Public http error data
	 */
	toHttp(): Record<string, unknown> & { message: string } {
		return {
			...this.httpData,
			message: this.message,
		};
	}
}

/**
 * A public aggregate error
 *
 * Allow multiple errors to be thrown together
 */
export class PublicHttpAggregateError extends Error implements ToHttpException {
	/// The original error message
	private readonly originalMessage: string;

	/// List of errors passed to its constructor
	public readonly errors: unknown[];

	/// The sub error messages
	private readonly errorMessages: string[];

	constructor(originalMessage: string, errors: unknown[]) {
		const errorMessages = errors
			.map((err) => PublicHttpAggregateError.getSubErrorPublicMessage(err))
			.filter(Boolean) as string[];
		super(PublicHttpAggregateError.buildErrorMessage(originalMessage, errorMessages));
		this.originalMessage = originalMessage;
		this.errors = errors;
		this.errorMessages = errorMessages;
	}

	/**
	 * Get the public error message
	 */
	getPublicErrorMessage() {
		return this.message;
	}

	/// Build the full message from the error
	private static buildErrorMessage(msg: string, errors: string[]): string {
		if (errors.length <= 0) {
			return msg;
		}
		const errorsMapped = errors.map((err) => `  - ${err}`);
		return `${msg}\n\n${errorsMapped.join('\n')}`;
	}

	/**
	 * Get the public message of a given error
	 * @param error
	 * @returns A string with the public message or null
	 */
	private static getSubErrorPublicMessage(error: unknown) {
		if (error == null) {
			return null;
		}
		if (typeof error === 'string') {
			return error;
		}
		if (typeof error !== 'object') {
			return null;
		}
		if ('getPublicErrorMessage' in error) {
			return (error as PublicHttpError).getPublicErrorMessage();
		}
		return null;
	}

	/**
	 * Convert to an HTTP exception
	 */
	toHttp() {
		return {
			status: 'error',
			message: this.originalMessage,
			errors: this.errorMessages,
		};
	}
}
