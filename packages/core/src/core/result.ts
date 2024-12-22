import { ErrorCode } from './error';

/**
 * Result success type
 */

export type ResultSuccess<TValue> = TValue extends void
	? {
			success: true;
			value?: undefined;
			error?: undefined;
			errors?: undefined;
			errorValue?: undefined;
			errorCode?: undefined;
		}
	: {
			success: true;
			value: TValue;
			error?: undefined;
			errors?: undefined;
			errorValue?: undefined;
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
	errorValue?: unknown;
	errorCode?: string | null;
};

/**
 * Result type
 */
export type Result<TValue> = ResultSuccess<TValue> | ResultError;

/**
 * Invoke a callback and then return its value as a result
 */
export function resultTry<T>(fn: () => T): Result<T> {
	try {
		return resultSuccess(fn());
	} catch (err) {
		return resultErrorUnknown(err);
	}
}
/**
 * Invoke a callback and then return its value as a result. (Async version)
 */
export function resultTryAsync<T>(fn: () => Promise<T> | T): Promise<Result<T>> {
	return Promise.resolve().then(fn).then(resultSuccess, resultErrorUnknown);
}

/**
 * Create a result success value
 */
export function resultSuccess<T>(value: T): ResultSuccess<T> {
	return {
		success: true,
		value,
	} as ResultSuccess<T>;
}

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
 * Create a result error from an unkown object
 */
export function resultErrorUnknown(error: unknown, defaultMessage?: string): ResultError {
	if (error == null) {
		return {
			success: false,
			error: defaultMessage ?? 'Error',
		};
	} else if (typeof error === 'string') {
		return {
			success: false,
			error: error || (defaultMessage ?? 'Error'),
		};
	} else if (error instanceof ErrorCode) {
		return {
			success: false,
			error: error.message,
			errorCode: error.errorCode,
			errorValue: error.errorValue,
		};
	} else if (error instanceof Error) {
		return {
			success: false,
			error: error.message,
			errorValue: error,
		};
	}
	return {
		success: false,
		error: defaultMessage ?? 'Error',
		errorValue: error,
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
		errorValue: errorsValueConcat(errorA.errorValue, errorB.errorValue),
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

// Concat two error values
function errorsValueConcat(errorValueAParam: unknown, errorValueBParam: unknown): unknown {
	if (errorValueAParam == null) {
		return errorValueBParam;
	} else if (errorValueBParam == null) {
		return errorValueAParam;
	}
	if (Array.isArray(errorValueAParam)) {
		return errorValueAParam.concat(errorValueBParam);
	}
	return [errorValueAParam].concat(errorValueBParam);
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
