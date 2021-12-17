import { PipeTransform } from '@nestjs/common';
import {
	dateParse,
	dateTryParse,
	DateType,
	Decimal,
	decimalParse,
	decimalTryParse,
} from '@rhangai/common';

export const DatePipe: PipeTransform<any, DateType> = {
	transform(value) {
		return dateParse(value, { inputFormat: 'YYYY-MM-DD' });
	},
};

export const DatePipeOptional: PipeTransform<any, DateType | null> = {
	transform(value) {
		return dateTryParse(value, { inputFormat: 'YYYY-MM-DD' });
	},
};

export const DecimalPipe: PipeTransform<any, Decimal> = {
	transform(value) {
		return decimalParse(value);
	},
};

export const DecimalPipeOptional: PipeTransform<any, Decimal | null> = {
	transform(value) {
		return decimalTryParse(value);
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
