import { createValidator } from '../create-validator';
import { ValidateError } from '../error';

export type ValidatorToIntOptions = {
	min?: number | null;
	max?: number | null;
};

const NOT_A_NUMBER = /[^\d]/;
export function ToInt(options?: ValidatorToIntOptions) {
	return createValidator((v: unknown) => {
		let numberValue: number | null = null;
		if (typeof v === 'number') numberValue = v;
		else if (typeof v === 'string') {
			let stringValue = v.trim();
			const isNegative = stringValue.charAt(0) === '-';
			if (isNegative) {
				stringValue = stringValue.substr(1).trim();
			}
			if (NOT_A_NUMBER.test(stringValue)) throw new ValidateError(`Invalid number ${v}`);
			numberValue = parseInt(stringValue, 10);
			if (isNegative) numberValue = -numberValue;
		}
		if (numberValue == null || !Number.isFinite(numberValue))
			throw new ValidateError(`Cannot convert ${v} to int`);

		const min = options?.min;
		if (min != null && numberValue < min)
			throw new ValidateError(`Invalid number. Min: ${min}. Passed: ${numberValue}`);
		const max = options?.max;
		if (max != null && numberValue > max)
			throw new ValidateError(`Invalid number. Max: ${max}. Passed: ${numberValue}`);
		return numberValue;
	});
}
