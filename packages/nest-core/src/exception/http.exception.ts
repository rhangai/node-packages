export interface ToHttpException {
	toHttp(): Record<string, unknown> & { message: string };
}

export class PublicHttpError extends Error implements ToHttpException {
	constructor(message?: string, private readonly httpData?: Record<string, unknown>) {
		super(message);
	}

	toHttp(): Record<string, unknown> & { message: string } {
		return {
			...this.httpData,
			message: this.message,
		};
	}
}
