import { createValidator, createValidatorDecorator, ValidatorParam } from '../create-validator';
import { arrayMap, Class } from '../util';
import { IsObject } from './object';

export function IsArray(validatorParam: ValidatorParam) {
	const validator = createValidator(validatorParam);
	return createValidatorDecorator((value: any) => {
		if (value == null || !Array.isArray(value)) throw new Error(``);
		if (!validator) return value;
		return arrayMap(value, (item) => validator.validate(item));
	});
}

export function IsArrayOf(target: () => Class<any>) {
	return IsArray(IsObject(target));
}
