import { type IPublicMessageException, type IToHttpException } from '@rhangai/core';

export class SheetReaderError extends Error implements IPublicMessageException, IToHttpException {
	public readonly errorCode: string;
	public readonly errorMessage: string;
	private readonly errorMessageList: string[];

	constructor(
		errorCode: string | undefined | null,
		errorMessage: string | undefined | null,
		errorMessageList: string[] | undefined | null,
		errorValue?: unknown,
	) {
		const list = errorMessageList ?? [];
		super([errorMessage, formatErrors('Messages', list, (m) => m)].join('\n'), {
			cause: errorValue,
		});
		this.errorCode = errorCode ?? 'WORKSHEET_INVALID';
		this.errorMessage = errorMessage ?? 'Erro ao ler a planilha';
		this.errorMessageList = list;
	}
	/**
	 * Get the public error message
	 */
	getPublicErrorMessage() {
		return [
			// Public error message
			this.errorMessage,
			formatErrors('', this.errorMessageList, (m) => m),
		].join('\n');
	}
	/**
	 * Implementa o toHttp para ser usado em conjunto com o nest
	 * @returns
	 */
	toHttp() {
		return {
			message: this.errorMessage,
			errors: this.errorMessageList,
			errorCode: this.errorCode,
		};
	}
}

// Format errors
function formatErrors<T>(prefix: string, items: T[], formatter: (item: T) => string) {
	if (items.length <= 0) {
		return null;
	}
	const errorMessages = items
		.map(formatter)
		.map((item) => item.split('\n').join('\n    '))
		.filter(Boolean);
	if (errorMessages.length <= 0) {
		return null;
	}
	return `${prefix}\n  - ${errorMessages.join('\n  - ')}`;
}
