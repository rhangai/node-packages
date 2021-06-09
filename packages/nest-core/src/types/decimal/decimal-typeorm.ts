import { Column, ColumnOptions } from 'typeorm';
import { decimalParse } from './decimal-parse';
import { Decimal } from './decimal-type';

export type DecimalColumnOptions = Omit<ColumnOptions, 'precision' | 'scale'> & {
	negative?: boolean;
};

export function DecimalColumn(
	precision: number,
	scale: number,
	options: DecimalColumnOptions = {}
) {
	const { negative, ...columnOptions } = options;
	return Column({
		...columnOptions,
		precision,
		scale,
		type: 'decimal',
		transformer: {
			from(v: string): Decimal | null {
				if (v == null || !v) return null;
				if (typeof v !== 'string') return null;
				return new Decimal(v, 10);
			},
			to(v: any): string | null {
				if (v == null || !v) return null;
				const decimal = decimalParse(v);
				decimalAssertRange(decimal, precision, !!negative);
				return decimal.toFixed(scale);
			},
		},
	});
}

const DECIMAL_MAX_RANGE: Record<string, Decimal> = {};
function decimalAssertRange(decimal: Decimal, precision: number, negative: boolean) {
	let decimalMax = DECIMAL_MAX_RANGE[precision];
	if (!decimalMax) {
		const decimalStr = `1${'0'.repeat(precision)}`;
		decimalMax = new Decimal(decimalStr, 10);
		DECIMAL_MAX_RANGE[precision] = decimalMax;
	}
	if (decimal.gte(decimalMax)) throw new Error(`Decimal maior que o máximo permitido.`);

	if (negative) {
		if (decimal.lte(decimalMax.negated()))
			throw new Error(`Decimal menor que o mínimo permitido.`);
	} else if (decimal.lt(0)) {
		throw new Error(`Decimal menor que 0 não permitido`);
	}
}
