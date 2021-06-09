import { createValidator } from '../create-validator';
import { ValidateError } from '../error';
import { Class, isPromiseLike } from '../util';
import { resolveValidator, ValidatorParam } from '../validator/resolve';
import { IsObject } from './object';

export type ValidatorIsArrayOptions = {
	minLength?: number | null;
	maxLength?: number | null;
};

export function IsArray(validatorParam: ValidatorParam, options?: ValidatorIsArrayOptions) {
	const validator = resolveValidator(validatorParam);
	return createValidator((value: any) => {
		if (value == null || !Array.isArray(value)) throw new ValidateError(`Not an array.`);

		const minLength = options?.minLength;
		if (minLength != null && value.length < minLength)
			throw new ValidateError(`Invalid length. Min: ${minLength}. Passed: ${value.length}`);
		const maxLength = options?.maxLength;
		if (maxLength != null && value.length > maxLength)
			throw new ValidateError(`Invalid length. Max: ${maxLength}. Passed: ${value.length}`);

		if (!validator) return value;

		const output: unknown[] = [];
		const promises: Promise<void>[] = [];
		const errorMap: Record<string, Error> = {};
		for (let i = 0; i < value.length; ++i) {
			let result: unknown;
			try {
				result = validator.validate(value[i]);
			} catch (err) {
				errorMap[`[${i}]`] = err;
				continue;
			}
			if (isPromiseLike(result)) {
				const index = i;
				output.push(null);
				promises.push(
					result.then(
						(r) => {
							output[index] = r;
						},
						(err) => {
							errorMap[`[${index}]`] = err;
						}
					)
				);
			} else {
				output.push(result);
			}
			output.push(result);
		}
		const getOutput = () => {
			if (Object.keys(errorMap).length > 0) throw new ValidateError('', errorMap);
			return output;
		};
		if (promises.length > 0) {
			return Promise.all(promises).then(getOutput);
		}
		return getOutput();
	});
}

export function IsArrayOf(target: () => Class<any>, options?: ValidatorIsArrayOptions) {
	return IsArray(IsObject(target), options);
}
