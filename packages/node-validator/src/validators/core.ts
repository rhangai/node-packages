import { createValidatorDecorator } from '../create-validator';

export function Validate() {
	return createValidatorDecorator(null);
}

export type ValidatorToStringOptions = {
	normalize?: boolean;
};

export function ToString(options?: ValidatorToStringOptions) {
	return createValidatorDecorator((v: unknown) => {
		let value = `${v}`;
		if (options?.normalize !== false) {
			value = value.trim().replace(/\s+/g, ' ');
		}
		return value;
	});
}

export function ToInt() {
	return createValidatorDecorator((v: unknown) => {
		if (typeof v === 'number') return v;
		else if (typeof v === 'string') return parseInt(v, 10);
		throw new Error(`Cannot convert ${v} to int`);
	});
}
