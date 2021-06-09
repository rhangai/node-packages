import { createValidator } from '../create-validator';
import { ValidateError } from '../error';

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
