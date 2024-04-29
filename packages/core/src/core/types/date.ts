import dayjs from 'dayjs';
import type { Result } from '../result';

/// Date type
export type DateType = dayjs.Dayjs;
/// Date value
export const DateType = dayjs.Dayjs;

/**
 * Check if the date is a date type
 */
export function dateIsValue(v: unknown): v is DateType {
	return dayjs.isDayjs(v);
}

/// Input for date
export type DateTypeInput = string | Date | DateType;

/**
 * Check if the date is an input type for date
 */
export function dateIsInput(v: unknown): v is DateTypeInput {
	if (!v) return false;
	if (typeof v === 'string') return true;
	if (v instanceof Date) return true;
	return dayjs.isDayjs(v);
}

/**
 * Parse options for input
 */
export type DateParseOptions = {
	inputFormat?: string | null;
};

/**
 * Safely parses a date
 *
 * Return a result with the date and the status
 */
export function dateSafeParse(
	param: unknown,
	{ inputFormat }: DateParseOptions = {},
): Result<DateType> {
	let date: DateType | undefined;
	if (typeof param === 'string') {
		const format = inputFormat ?? 'YYYY-MM-DD';
		date = dayjs(param, format, true);
		if (date.format(format) !== param) {
			return {
				success: false,
				error: `Invalid date format. Expected ${format}. Given ${param}`,
			};
		}
	} else if (param instanceof Date) {
		date = dayjs(param);
	} else if (dayjs.isDayjs(param)) {
		date = param;
	}
	if (!date || !date.isValid()) {
		return {
			success: false,
			error: `Invalid date. Expected ${inputFormat}. Given ${param}`,
		};
	}
	return {
		success: true,
		value: date,
	};
}

/**
 * Parse a date.
 * Throws an exception in case the date is invalid
 */
export function dateParse(param: unknown, options: DateParseOptions = {}): DateType {
	const { success, value, error } = dateSafeParse(param, options);
	if (!success) throw new Error(error ?? `Invalid date: ${param}`);
	return value;
}

/**
 * Get the current date
 */
export function dateNow(): DateType {
	return dayjs();
}
