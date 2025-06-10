interface SheetResultSuccessVoid {
	success: true;
	data?: undefined;
	error?: never;
}

interface SheetResultSuccess<TValue> {
	success: true;
	data: TValue;
	error?: never;
}

export interface SheetResultError {
	success: false;
	data?: never;
	error: unknown;
}

export type SheetResult<TValue> = TValue extends void
	? SheetResultSuccessVoid | SheetResultError
	: SheetResultSuccess<TValue> | SheetResultError;
