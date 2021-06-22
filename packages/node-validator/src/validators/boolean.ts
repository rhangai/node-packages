import { createValidator } from '../create-validator';
import { ValidateError } from '../error';

export type ValidatorToBooleanOptions = {
	allowNullAsFalse?: boolean;
};

export function ToBoolean(options?: ValidatorToBooleanOptions) {
	return createValidator((v: unknown) => {
		if (v == null) {
			if (options?.allowNullAsFalse) return false;
			throw new ValidateError(`${v} cannot be converted to boolean`);
		}
		if (v === true) return true;
		if (v === false) return false;
		throw new ValidateError(`${v} cannot be converted to boolean`);
	});
}
