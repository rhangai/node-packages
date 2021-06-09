import { Class } from './util';
import { ValidatorMetadataClassStorage } from './metadata';
import { createValidator, ValidatorParam } from './create-validator';

export function validate<T>(target: Class<T>, input: unknown): T | Promise<T> {
	const classStorage = ValidatorMetadataClassStorage.get(target);
	if (!classStorage) throw new Error(`Invalid validator for ${target.name}`);
	return classStorage.validate(input);
}

export function validateValue<T>(value: unknown, validatorParam: ValidatorParam): T | Promise<T> {
	const validator = createValidator(validatorParam);
	if (!validator) return value as T;
	return validator.validate(value);
}
