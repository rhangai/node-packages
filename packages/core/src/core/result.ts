import { errorMessage } from './error';

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
	errorParam: unknown,
	errorCode?: string | null,
	errors?: unknown[],
): ResultError {
	return {
		success: false,
		error: errorMessage(errorParam),
		errors: errors?.map((e) => errorMessage(e)).filter(Boolean) as string[] | undefined,
		errorCode,
	};
}
