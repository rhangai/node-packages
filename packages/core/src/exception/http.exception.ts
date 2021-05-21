export interface ToHttpException {
	toHttp(): Record<string, unknown> & { message: string };
}
