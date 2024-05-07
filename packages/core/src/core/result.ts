/**
 * Result success type
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type ResultSuccess<TValue> = TValue extends void
	? {
			success: true;
			value?: undefined;
			error?: undefined;
			errors?: undefined;
			errorCode?: undefined;
		}
	: {
			success: true;
			value: TValue;
			error?: undefined;
			errors?: undefined;
			errorCode?: undefined;
		};

/**
 * Result error type
 */
export type ResultError = {
	success: false;
	value?: undefined;
	error?: string | null;
	errors?: string[];
	errorCode?: string | null;
};

/**
 * Result type
 */
export type Result<TValue> = ResultSuccess<TValue> | ResultError;

/**
 * Create a result error
 */
export function resultError(
	error: string | null,
	errorCode?: string | null,
	errors?: Array<string | null | undefined>,
): ResultError {
	return {
		success: false,
		error,
		errors: errorsListFilter(errors),
		errorCode,
	};
}

/**
 * Merge two errors
 */
export function resultErrorMerge(
	errorA: ResultError | null | undefined,
	errorB: ResultError | null | undefined,
): ResultError {
	if (!errorA) {
		if (!errorB) {
			return { success: false };
		}
		return errorB;
	} else if (!errorB) {
		return errorA;
	}
	return {
		success: false,
		error: errorA.error ?? errorB.error,
		errors: errorsListConcat(errorA.errors, errorB.errors),
		errorCode: errorA.errorCode ?? errorB.errorCode,
	};
}

// Concat two error list
function errorsListConcat(
	errorsAParam: Array<string | null | undefined> | null | undefined,
	errorsBParam: Array<string | null | undefined> | null | undefined,
): string[] | undefined {
	const errorsA = errorsListFilter(errorsAParam);
	const errorsB = errorsListFilter(errorsBParam);
	if (!errorsA) {
		return errorsB;
	}
	if (!errorsB) {
		return errorsA;
	}
	return errorsA.concat(errorsB);
}

function errorsListFilter(
	errors: Array<string | null | undefined> | null | undefined,
): string[] | undefined {
	if (errors == null) {
		return undefined;
	}
	const errorsFiltered = errors.filter(Boolean) as string[];
	if (errorsFiltered.length <= 0) {
		return undefined;
	}
	return errorsFiltered;
}
