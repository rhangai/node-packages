import type { PipeTransform } from '@nestjs/common';
import { dateParse, DateType, Decimal, decimalParse } from '@rhangai/core';

export const DatePipe: PipeTransform<any, DateType> = {
	transform(input) {
		return dateParse(input, { inputFormat: 'YYYY-MM-DD' });
	},
};

export const DatePipeOptional: PipeTransform<any, DateType | null> = {
	transform(input) {
		if (input == null || input === '') return null;
		return dateParse(input, { inputFormat: 'YYYY-MM-DD' });
	},
};

export const DecimalPipe: PipeTransform<any, Decimal> = {
	transform(input) {
		return decimalParse(input);
	},
};

export const DecimalPipeOptional: PipeTransform<any, Decimal | null> = {
	transform(input) {
		if (input == null || input === '') return null;
		return decimalParse(input);
	},
};

export const IntPipe: PipeTransform<any, number> = {
	transform(input) {
		const value = parseInt(input, 10);
		if (!Number.isFinite(value)) throw new Error(`${input} is not a number`);
		return value;
	},
};

export const IntPipeOptional: PipeTransform<any, number | null> = {
	transform(input) {
		if (input == null || input === '') return null;
		const value = parseInt(input, 10);
		if (!Number.isFinite(value)) return null;
		return value;
	},
};
