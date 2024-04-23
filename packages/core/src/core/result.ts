/**
 * Result success type
 */
export type ResultSuccess<TValue> = {
	success: true;
	value: TValue;
	error?: undefined;
};
/**
 * Result error type
 */
export type ResultError = {
	success: false;
	value?: undefined;
	error?: string | null;
};
/**
 * Result type
 */
export type Result<TValue> = ResultSuccess<TValue> | ResultError;
