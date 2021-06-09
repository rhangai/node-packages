import { createValidator } from '../create-validator';
import { ValidatorParam } from '../validator/resolve';

export function Validate(validatorParams?: ValidatorParam) {
	return createValidator(validatorParams);
}
