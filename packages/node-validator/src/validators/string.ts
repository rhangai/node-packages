import { createValidator } from '../create-validator';
import { ValidateError } from '../error';

export type ValidatorToStringOptions = {
	trim?: boolean;
	normalize?: boolean;
	allowEmpty?: boolean;
};

export function ToString(options?: ValidatorToStringOptions) {
	return createValidator((v: unknown) => {
		let value: string;
		if (v == null) {
			value = '';
		} else if (typeof v !== 'string' && typeof v !== 'number') {
			throw new ValidateError(`Cannot be assigned to string - ${v}.`);
		} else {
			value = `${v}`;
		}
		if (options?.trim !== false) {
			value = value.trim();
		}
		if (options?.normalize !== false) {
			value = value.replace(/\s+/g, ' ');
		}
		if (value === '' && !options?.allowEmpty) {
			throw new ValidateError(`Cannot be empty`);
		}
		return value;
	});
}

export function ToText(options?: ValidatorToStringOptions) {
	return ToString({
		normalize: false,
		...options,
	});
}
