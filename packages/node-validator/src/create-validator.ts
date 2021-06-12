import { ValidatorDecorator, VALIDATOR_DECORATOR_KEY } from './constants';
import { ValidatorMetadataClass } from './metadata';
import { Class } from './util';
import { resolveValidator, ValidatorParam } from './validator/resolve';

export function createValidator(validatorParam: ValidatorParam): ValidatorDecorator {
	const validator = resolveValidator(validatorParam);
	const decorator = ((target: any, propertyKey: string | symbol): void => {
		const classStorage = ValidatorMetadataClass.assert(target.constructor as Class<any>);
		classStorage.field(propertyKey).prependValidator(validator);
	}) as ValidatorDecorator;
	decorator[VALIDATOR_DECORATOR_KEY] = validator;
	return decorator;
}
