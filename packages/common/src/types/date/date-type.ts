import dayjs from 'dayjs';

export type DateType = dayjs.Dayjs;
export type DateTypeInput = string | Date | DateType;

export function dateIsValue(v: unknown): v is DateType {
	return dayjs.isDayjs(v);
}

export function dateIsInput(v: unknown): v is DateTypeInput {
	if (typeof v === 'string') return true;
	if (v instanceof Date) return true;
	return dayjs.isDayjs(v);
}

export function dateNow(): DateType {
	return dayjs();
}
