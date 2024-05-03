import { dateParse, DateType } from '@rhangai/core';
import { Column, type ColumnOptions } from 'typeorm';
import { isFindOperator } from './util.internal';

export function DateColumn(options?: ColumnOptions) {
	return Column({
		...options,
		type: 'date',
		transformer: {
			from(v: string | null): DateType | null {
				if (v == null || !v) {
					return null;
				}
				if (typeof v !== 'string') {
					return null;
				}
				return dateParse(v, { inputFormat: 'YYYY-MM-DD' });
			},
			to(param: unknown) {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (param == null || !param) {
					return undefined;
				}
				if (isFindOperator(param)) {
					return param;
				}
				const obj = dateParse(param, { inputFormat: 'YYYY-MM-DD' });
				return obj.format('YYYY-MM-DD');
			},
		},
	});
}
