import dayjs, { isDayjs } from 'dayjs';
import { Result } from '../result';
import { DateType, DateTypeInput } from './date-type';

export type DateParseOptions = {
	inputFormat?: string | null;
};

/**
 * Safely parses a date
 */
export function dateSafeParse(param: unknown, { inputFormat }: DateParseOptions): Result<DateType> {
	let date: DateType | undefined;
	if (typeof param === 'string') {
		date = dayjs(param, inputFormat ?? undefined);
	} else if (param instanceof Date) {
		date = dayjs(param);
	} else if (isDayjs(param)) {
		date = param;
	}
	if (!date || !date.isValid()) {
		return {
			success: false,
			error: `Invalid date. Expected ${inputFormat}. Given ${param}`,
		};
	}
	if (inputFormat != null) {
		if (date.format(inputFormat) !== param) {
			return {
				success: false,
				error: `Invalid date format. Expected ${inputFormat}. Given ${param}`,
			};
		}
	}
	return {
		success: true,
		value: date,
	};
}

/**
 * Try to parse a date
 */
export function dateTryParse(param: DateTypeInput, options: DateParseOptions): DateType | null {
	const { success, value } = dateSafeParse(param, options);
	return success ? value : null;
}

/**
 * Parse a date
 */
export function dateParse(param: DateTypeInput, options: DateParseOptions): DateType {
	const { success, value, error } = dateSafeParse(param, options);
	if (!success) throw new Error(error ?? `Invalid date: ${param}`);
	return value;
}
