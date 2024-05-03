import type { PipeTransform } from '@nestjs/common';
import { dateParse, DateType, Decimal, decimalParse, intParse, intParseOr } from '@rhangai/core';

export const DatePipe: PipeTransform<unknown, DateType> = {
	transform(input) {
		return dateParse(input, { inputFormat: 'YYYY-MM-DD' });
	},
};

export const DatePipeOptional: PipeTransform<unknown, DateType | null> = {
	transform(input) {
		if (input == null || input === '') {
			return null;
		}
		return dateParse(input, { inputFormat: 'YYYY-MM-DD' });
	},
};

export const DecimalPipe: PipeTransform<unknown, Decimal> = {
	transform(input) {
		return decimalParse(input);
	},
};

export const DecimalPipeOptional: PipeTransform<unknown, Decimal | null> = {
	transform(input) {
		if (input == null || input === '') {
			return null;
		}
		return decimalParse(input);
	},
};

export const IntPipe: PipeTransform<unknown, number> = {
	transform(input) {
		return intParse(input);
	},
};

export const IntPipeOptional: PipeTransform<unknown, number | null> = {
	transform(input) {
		if (input == null || input === '') {
			return null;
		}
		return intParseOr(input, null);
	},
};
