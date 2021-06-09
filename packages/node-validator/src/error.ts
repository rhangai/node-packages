/**
 *
 */
export class ValidateError extends Error {
	public readonly errorMap!: Readonly<Record<string, Error>>;

	constructor(messageParam: string | null, errorMap: Record<string, Error> | null = null) {
		const message = ValidateError.buildErrorMessage(messageParam ?? '', errorMap);
		super(message);
		Object.defineProperty(this, 'errorMap', {
			enumerable: false,
			configurable: true,
			value: errorMap,
		});
	}

	static buildErrorMessage(message: string, errorMap: Record<string, Error> | null): string {
		let errors: string[] = [];
		if (errorMap) {
			errors = Object.entries(errorMap).map(([field, error]) => {
				const errorMessage = error.message.split('\n');
				for (let i = 1; i < errorMessage.length; ++i) {
					errorMessage[i] = `  ${errorMessage[i]}`;
				}
				return `${field}: ${errorMessage.join('\n')}`;
			});
		}
		if (errors.length <= 0) return message;
		return `${message}\n  - ${errors.join('\n  - ')}`;
	}
}
