import { createValidator } from '../create-validator';
import { ValidateError } from '../error';
import { ValidatorParam } from '../validator/resolve';

export function Validate(validatorParams?: ValidatorParam) {
	return createValidator(validatorParams);
}

export type ValidatorToStringOptions = {
	normalize?: boolean;
};

export function ToString(options?: ValidatorToStringOptions) {
	return createValidator((v: unknown) => {
		if (v == null) throw new ValidateError(`${v} cannot be assigned to string`);
		else if (typeof v !== 'string' && typeof v !== 'number')
			throw new ValidateError(`${v} cannot be assigned to string`);
		let value = `${v}`;
		if (options?.normalize !== false) {
			value = value.trim().replace(/\s+/g, ' ');
		}
		return value;
	});
}

export type ValidatorToIntOptions = {
	min?: number | null;
	max?: number | null;
};
export function ToInt(options?: ValidatorToIntOptions) {
	return createValidator((v: unknown) => {
		let numberValue: number | null = null;
		if (typeof v === 'number') numberValue = v;
		else if (typeof v === 'string') numberValue = parseInt(v, 10);
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
