import { Column, ColumnOptions } from 'typeorm';
import dayjs from 'dayjs';
import { DateType } from './date-type';
import { dateParse } from './date-parse';

export function DateColumn(options?: ColumnOptions) {
	return Column({
		...options,
		type: 'date',
		transformer: {
			from(v: string): DateType | null {
				if (v == null || !v) return null;
				if (typeof v !== 'string') return null;
				return dayjs(v, 'YYYY-MM-DD');
			},
			to(param: any): string | null {
				if (param == null || !param) return null;
				const obj = dateParse(param, { inputFormat: 'YYYY-MM-DD' });
				return obj.format('YYYY-MM-DD');
			},
		},
	});
}
