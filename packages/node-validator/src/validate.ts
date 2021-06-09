import { Class } from './util';
import { ValidatorMetadataClass } from './metadata';
import { resolveValidator, ValidatorParam } from './validator/resolve';
import { ValidateInput } from './validate-input';

export function validate<T>(target: Class<T>, input: ValidateInput<T>): T | Promise<T> {
	const classStorage = ValidatorMetadataClass.get(target);
	if (!classStorage) throw new Error(`Invalid validator for ${target.name}`);
	return classStorage.validate(input);
}

export function validateValue<T>(
	value: ValidateInput<T>,
	validatorParam: ValidatorParam
): T | Promise<T> {
	const validator = resolveValidator(validatorParam);
	if (!validator) return value as T;
	return validator.validate(value);
}
