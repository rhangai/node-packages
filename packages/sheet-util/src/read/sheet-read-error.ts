export enum SheetReadErrorCode {
	WORKSHEET_EMPTY = 'WORKSHEET_EMPTY',
	WORKSHEET_INVALID = 'WORKSHEET_INVALID',
	WORKSHEET_READ_COLUMN = 'WORKSHEET_READ_COLUMN',
}

/**
 * Error class
 */
export class SheetReadError extends Error {
	private readonly errorCode: SheetReadErrorCode;
	private readonly errorMessage: string;
	private readonly errorList: string[] | undefined;

	constructor(
		errorCode: SheetReadErrorCode,
		errorMessage: string,
		errorList?: string[],
		cause?: unknown,
	) {
		const message = [errorMessage, formatErrors('Messages', errorList)].join('\n');
		super(message, { cause });
		this.errorCode = errorCode;
		this.errorMessage = errorMessage;
		this.errorList = errorList && errorList.length > 0 ? errorList : undefined;
	}
	/**
	 * Clones the error, merging with another error list
	 */
	cloneMerge(errors: string[]): SheetReadError {
		if (errors.length <= 0) {
			return this;
		}
		return new SheetReadError(
			this.errorCode,
			this.errorMessage,
			this.errorList ? this.errorList.concat(errors) : errors,
			this.cause,
		);
	}
	/**
	 * Get the public error message
	 */
	getPublicErrorMessage() {
		return [
			// Public error message
			this.errorMessage,
			formatErrors('', this.errorList),
		].join('\n');
	}
	/**
	 * Implementa o toHttp para ser usado em conjunto com o nest
	 * @returns
	 */
	toHttp() {
		return {
			message: this.errorMessage,
			errors: this.errorList,
			errorCode: this.errorCode,
		};
	}
}

/**
 * Bail error class. To catch and ignore
 */
export class SheetReadErrorBail extends Error {}

// Format errors
function formatErrors(prefix: string, items: string[] | undefined) {
	if (!items || items.length <= 0) {
		return null;
	}
	const errorMessages = items.map((item) => item.split('\n').join('\n    ')).filter(Boolean);
	if (errorMessages.length <= 0) {
		return null;
	}
	return `${prefix}\n  - ${errorMessages.join('\n  - ')}`;
}
