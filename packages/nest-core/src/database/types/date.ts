import { Column, ColumnOptions } from 'typeorm';
import { dateParse, DateType } from '@rhangai/common';

export function DateColumn(options?: ColumnOptions) {
	return Column({
		...options,
		type: 'date',
		transformer: {
			from(v: string): DateType | null {
				if (v == null || !v) return null;
				if (typeof v !== 'string') return null;
				return dateParse(v, { inputFormat: 'YYYY-MM-DD' });
			},
			to(param: any): string | null {
				if (param == null || !param) return null;
				const obj = dateParse(param, { inputFormat: 'YYYY-MM-DD' });
				return obj.format('YYYY-MM-DD');
			},
		},
	});
}
