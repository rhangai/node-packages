import { createValidator } from '../create-validator';
import { ValidateError } from '../error';

export function Validate() {
	return createValidator(null);
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

export function ToInt() {
	return createValidator((v: unknown) => {
		let numberValue: number | null = null;
		if (typeof v === 'number') numberValue = v;
		else if (typeof v === 'string') numberValue = parseInt(v, 10);
		if (numberValue == null || !Number.isFinite(numberValue))
			throw new ValidateError(`Cannot convert ${v} to int`);
		return numberValue;
	});
}
