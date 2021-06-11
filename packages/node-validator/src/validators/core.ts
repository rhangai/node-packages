import { ValidatorDecorator, VALIDATOR_DECORATOR_KEY } from '../constants';
import { createValidator } from '../create-validator';
import { ValidatorMetadataClass } from '../metadata';
import { ValidatorParam } from '../validator/resolve';

export function Validate(validatorParams?: ValidatorParam) {
	return createValidator(validatorParams);
}

export function IsOptional(): ValidatorDecorator {
	const decorator = ((target: any, propertyKey: string | symbol): void => {
		const classStorage = ValidatorMetadataClass.assert(target.constructor);
		classStorage.field(propertyKey).setOptional(true);
	}) as ValidatorDecorator;
	decorator[VALIDATOR_DECORATOR_KEY] = null;
	return decorator;
}
