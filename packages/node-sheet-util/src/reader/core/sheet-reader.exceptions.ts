export class SheetReaderException extends Error {
	constructor(
		private readonly errorMessage: string,
		private readonly errorMessageList: string[] = [],
		errorList: Error[] = []
	) {
		super(
			[
				errorMessage,
				formatErrors('Messages', errorMessageList, (m) => m),
				formatErrors('Errors', errorList, (e) => `${e.stack || e.toString()}`),
			].join('\n')
		);
	}

	/**
	 * Implementa o toHttp para ser usado em conjunto com o nest
	 * @returns
	 */
	toHttp() {
		return {
			message: this.errorMessage,
			errors: this.errorMessageList,
		};
	}
}

function formatErrors<T>(prefix: string, items: T[], formatter: (item: T) => string) {
	if (items.length <= 0) return null;
	const errorMessages = items
		.map(formatter)
		.map((item) => item.split('\n').join('\n    '))
		.filter(Boolean);
	if (errorMessages.length <= 0) return null;
	return `${prefix}\n  - ${errorMessages.join('\n  - ')}`;
}
