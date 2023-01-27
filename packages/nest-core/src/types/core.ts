import { PipeTransform } from '@nestjs/common';
import { dateParse, DateType, Decimal, decimalParse } from '@rhangai/common';

export const DatePipe: PipeTransform<any, DateType> = {
	transform(value) {
		return dateParse(value, { inputFormat: 'YYYY-MM-DD' });
	},
};

export const DatePipeOptional: PipeTransform<any, DateType | null> = {
	transform(input) {
		if (input == null || input === '') return null;
		return dateParse(input, { inputFormat: 'YYYY-MM-DD' });
	},
};

export const DecimalPipe: PipeTransform<any, Decimal> = {
	transform(value) {
		return decimalParse(value);
	},
};

export const DecimalPipeOptional: PipeTransform<any, Decimal | null> = {
	transform(input) {
		if (input == null || input === '') return null;
		return decimalParse(input);
	},
};

export const IntPipe: PipeTransform<any, number> = {
	transform(value) {
		const number = parseInt(value, 10);
		if (!Number.isFinite(number)) throw new Error(`${value} is not a number`);
		return number;
	},
};

export const IntPipeOptional: PipeTransform<any, number | null> = {
	transform(value) {
		const number = parseInt(value, 10);
		if (!Number.isFinite(number)) return null;
		return number;
	},
};
