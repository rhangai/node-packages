export class SheetReaderException extends Error {
	constructor(message: string, private readonly errors: string[] = []) {
		super(message);
	}

	/**
	 * Implementa o toHttp para ser usado em conjunto com o nest
	 * @returns
	 */
	toHttp() {
		return {
			message: this.message,
			errors: this.errors,
		};
	}
}
