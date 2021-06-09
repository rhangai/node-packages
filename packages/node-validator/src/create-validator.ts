import { Class } from './util';
import { ValidatorMetadataClass } from './metadata';
import { resolveValidator, ValidatorParam } from './validator/resolve';
import { ValidatorDecorator, VALIDATOR_DECORATOR_KEY } from './constants';

export function createValidator(validatorParam: ValidatorParam): ValidatorDecorator {
	const validator = resolveValidator(validatorParam);
	const decorator = ((target: any, propertyKey: string | symbol): void => {
		const classStorage = ValidatorMetadataClass.assert(target.constructor as Class<any>);
		classStorage.field(propertyKey).appendValidator(validator);
	}) as ValidatorDecorator;
	decorator[VALIDATOR_DECORATOR_KEY] = validator;
	return decorator;
}
