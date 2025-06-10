export interface SheetResultSuccess<TValue> {
	success: true;
	data: TValue;
	error?: never;
}

export interface SheetResultError {
	success: false;
	data?: never;
	error: unknown;
}

export type SheetResult<TValue> = SheetResultSuccess<TValue> | SheetResultError;
