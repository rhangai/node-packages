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
		errors: errorsFilter(errors),
		errorCode,
	};
}

/**
 * Create a result error concatenating
 */
export function resultErrorConcat(
	error: ResultError,
	errors?: Array<string | null | undefined>,
): ResultError {
	const errorsFiltered = errorsFilter(errors);
	if (!errorsFiltered) {
		return error;
	}
	let { errors: newErrors } = error;
	if (!newErrors || newErrors.length <= 0) {
		newErrors = errorsFiltered;
	} else {
		newErrors = newErrors.concat(errorsFiltered);
	}
	return {
		...error,
		errors: newErrors,
	};
}

function errorsFilter(errors: Array<string | null | undefined> | null | undefined) {
	if (errors == null) {
		return undefined;
	}
	const errorsFiltered = errors.filter(Boolean) as string[];
	if (errorsFiltered.length <= 0) {
		return undefined;
	}
	return errorsFiltered;
}
