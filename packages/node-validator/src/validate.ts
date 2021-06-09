import { Class, isPromiseLike } from './util';
import { ValidatorMetadataClassStorage } from './metadata';
import { createValidator, ValidatorParam } from './create-validator';

export function validate<T>(target: Class<T>, input: unknown): T | Promise<T> {
	const classStorage = ValidatorMetadataClassStorage.get(target);
	if (!classStorage) throw new Error(`Invalid validator for ${target.name}`);
	const output: Record<string, unknown> = {};
	const errors: Record<string, Error> = {};
	const promises: Promise<any>[] = [];
	// eslint-disable-next-line guard-for-in
	for (const fieldName in classStorage.fields) {
		const field = classStorage.fields[fieldName];
		let result: unknown;
		try {
			result = field.validate(input);
		} catch (err) {
			errors[fieldName] = err;
			continue;
		}
		if (isPromiseLike(result)) {
			promises.push(
				result.then(
					(r) => {
						output[fieldName] = r;
					},
					(err) => {
						errors[fieldName] = err;
					}
				)
			);
		} else {
			output[fieldName] = result;
		}
	}
	const getOutput = () => {
		if (Object.keys(errors).length > 0) throw new Error();
		return Object.setPrototypeOf(output, classStorage.classType.prototype) as T;
	};
	if (promises.length > 0) {
		return Promise.all(promises).then(getOutput);
	}
	return getOutput();
}

export function validateValue<T>(value: unknown, validatorParam: ValidatorParam): T | Promise<T> {
	const validator = createValidator(validatorParam);
	if (!validator) return value as T;
	return validator.validate(value);
}
