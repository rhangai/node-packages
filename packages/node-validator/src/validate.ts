import { ValidatorMetadataClass } from './metadata';
import { Class } from './util';
import { ValidateInput } from './validate-input';
import { resolveValidator, ValidatorParam } from './validator/resolve';

export function validate<T, TInput extends ValidateInput<T> = ValidateInput<T>>(
	target: Class<T>,
	input: TInput
): T | Promise<T> {
	const classStorage = ValidatorMetadataClass.get(target);
	if (!classStorage) throw new Error(`Invalid validator for ${target.name}`);
	return classStorage.validate(input);
}

export async function validateAsync<T, TInput extends ValidateInput<T> = ValidateInput<T>>(
	target: Class<T>,
	input: TInput
): Promise<T> {
	return validate(target, input);
}

export function validateArray<T, TInput extends ValidateInput<T> = ValidateInput<T>>(
	target: Class<T>,
	input: TInput[]
): Promise<T[]> {
	const classStorage = ValidatorMetadataClass.get(target);
	if (!classStorage) throw new Error(`Invalid validator for ${target.name}`);
	return Promise.all(input.map((item) => validate(target, item)));
}

export function validateValue<T>(
	value: ValidateInput<T>,
	validatorParam: ValidatorParam
): T | Promise<T> {
	const validator = resolveValidator(validatorParam);
	if (!validator) return value as T;
	return validator.validate(value);
}

export async function validateValueAsync<T>(
	value: ValidateInput<T>,
	validatorParam: ValidatorParam
): Promise<T> {
	return validateValue(value, validatorParam);
}
