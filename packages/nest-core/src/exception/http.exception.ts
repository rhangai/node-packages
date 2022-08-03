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
	constructor(message?: string, private readonly httpData?: Record<string, unknown>) {
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
 */
export class PublicHttpAggregateError extends Error implements ToHttpException {
	private readonly errorMessages: string[];

	private readonly originalMessage: string;

	public readonly errors: unknown[];

	constructor(originalMessage: string, errors: unknown[]) {
		const errorMessages = errors
			.map((err) => PublicHttpAggregateError.getSubErrorPublicMessage(err))
			.filter(Boolean) as string[];
		super(PublicHttpAggregateError.buildErrorMessage(originalMessage, errorMessages));
		this.originalMessage = originalMessage;
		this.errors = errors;
		this.errorMessages = errorMessages;
	}

	getPublicErrorMessage() {
		return this.message;
	}

	private static buildErrorMessage(msg: string, errors: string[]): string {
		if (errors.length <= 0) return msg;
		const errorsMapped = errors.map((err) => `  - ${err}`);
		return `${msg}\n\n${errorsMapped.join('\n')}`;
	}

	/**
	 * Get the public message of a given error
	 * @param error
	 * @returns A string with the public message or null
	 */
	private static getSubErrorPublicMessage(error: unknown) {
		if (error == null) return null;
		if (typeof error !== 'object') return null;
		if ('getPublicErrorMessage' in error) {
			return (error as PublicHttpError).getPublicErrorMessage();
		}
		return null;
	}

	toHttp() {
		return {
			status: 'error',
			message: this.originalMessage,
			errors: this.errorMessages,
		};
	}
}
