import type { Result } from '../result';
import { Decimal } from './decimal';

/**
 * Safely parses a decimal
 */
export function intSafeParse(param: unknown): Result<number> {
	let value: number | null = null;
	if (typeof param === 'number') {
		value = Math.floor(param);
	} else if (typeof param === 'string') {
		value = param === '' ? null : parseInt(param, 10);
	} else if (Decimal.isBigNumber(param)) {
		value = parseInt(param.toFixed(0, Decimal.ROUND_FLOOR), 10);
	}
	if (value == null || !Number.isFinite(value)) {
		return {
			success: false,
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			error: `Invalid Int. ${param}`,
		};
	}
	return {
		success: true,
		value,
	};
}

/**
 * Parses an integer.
 * Throws when there is an error
 */
export function intParse(param: unknown): number {
	const { success, value, error } = intSafeParse(param);
	if (!success) {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		throw new Error(error ?? `Invalid Int: ${param}`);
	}
	return value;
}

/**
 * Parses an integer. Return the default value in case of errors
 */
export function intParseOr(param: unknown, defaultValue: number): number;
export function intParseOr(param: unknown, defaultValue: null): number | null;
export function intParseOr(param: unknown, defaultValue: number | null): number | null {
	const { success, value } = intSafeParse(param);
	if (!success) {
		return defaultValue;
	}
	return value;
}
