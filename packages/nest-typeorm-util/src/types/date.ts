import { dateParse, DateType } from '@rhangai/common';
import { Column, ColumnOptions } from 'typeorm';
import { isFindOperator } from './util';

export function DateColumn(options?: ColumnOptions) {
	return Column({
		...options,
		type: 'date',
		transformer: {
			from(v: string | null): DateType | null {
				if (v == null || !v) return null;
				if (typeof v !== 'string') return null;
				return dateParse(v, { inputFormat: 'YYYY-MM-DD' });
			},
			to(param: any): string | null | undefined {
				if (param == null || !param) return undefined;
				if (isFindOperator(param)) {
					return param;
				}
				const obj = dateParse(param, { inputFormat: 'YYYY-MM-DD' });
				return obj.format('YYYY-MM-DD');
			},
		},
	});
}
