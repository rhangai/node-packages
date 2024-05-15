import dayjs from 'dayjs';
import { type Result } from '../result';

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
	if (!v) {
		return false;
	}
	if (typeof v === 'string') {
		return true;
	}
	if (v instanceof Date) {
		return true;
	}
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
 * Return a result with the date and the status.
 */
export function dateSafeParse(param: unknown, options: DateParseOptions = {}): Result<DateType> {
	let date: DateType | undefined;
	if (typeof param === 'string') {
		const format = options.inputFormat ?? 'YYYY-MM-DD';
		const paramStr = param.trim();
		if (paramStr[10] === 'T') {
			date = dayjs(paramStr);
		} else {
			const parsedDate = dayjs(paramStr, format, true);
			if (parsedDate.format(format) === paramStr) {
				date = parsedDate;
			}
		}
		if (!date?.isValid()) {
			return {
				success: false,
				error: `Invalid date format. Expected ${format}. Given ${paramStr}`,
			};
		}
	} else if (param instanceof Date) {
		date = dayjs(param);
	} else if (dayjs.isDayjs(param)) {
		date = param;
	}
	if (!date?.isValid()) {
		return {
			success: false,
			// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
			error: `Invalid date. Given ${param}`,
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
	if (!success) {
		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		throw new Error(error ?? `Invalid date: ${param}`);
	}
	return value;
}

/**
 * Parses a Date or returns the default value
 */
export function dateParseOr(param: unknown, defaultValue: DateType): DateType;
export function dateParseOr(param: unknown, defaultValue: null): DateType | null;
export function dateParseOr(param: unknown, defaultValue: DateType | null): DateType | null {
	const { success, value } = dateSafeParse(param);
	if (!success) {
		return defaultValue;
	}
	return value;
}

/**
 * Get the current date
 */
export function dateNow(): DateType {
	return dayjs();
}
