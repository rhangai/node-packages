import dayjs from 'dayjs';
import { Result } from '../result';
import { DateType, DateTypeInput } from './date-type';

export type DateParseOptions = {
	inputFormat?: string | null;
};

/**
 * Safely parses a date
 *
 * Return a result with the date and the status
 */
export function dateSafeParse(param: unknown, { inputFormat }: DateParseOptions): Result<DateType> {
	let date: DateType | undefined;
	if (typeof param === 'string') {
		date = dayjs(param, inputFormat ?? undefined);
		if (inputFormat != null) {
			if (date.format(inputFormat) !== param) {
				return {
					success: false,
					error: `Invalid date format. Expected ${inputFormat}. Given ${param}`,
				};
			}
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
 * Parse a date
 */
export function dateParse(param: DateTypeInput, options: DateParseOptions): DateType {
	const { success, value, error } = dateSafeParse(param, options);
	if (!success) throw new Error(error ?? `Invalid date: ${param}`);
	return value;
}
