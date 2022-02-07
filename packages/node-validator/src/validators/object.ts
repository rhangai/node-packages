import { createValidator } from '../create-validator';
import { ValidateError } from '../error';
import { ValidatorMetadataClass } from '../metadata';
import { Class } from '../util';

export function IsObject<T>(target: () => Class<T>) {
	return createValidator((value: any) => {
		const classType = target();
		const validator = ValidatorMetadataClass.get(classType);
		if (!validator) throw new ValidateError(`No validator for target. ${classType.name}`);
		return validator.validate(value);
	});
}

export function IsAnyObject() {
	return createValidator((value: any) => {
		if (value == null) throw new ValidateError(`Invalid object. (null/undefined)`);
		if (Array.isArray(value)) throw new ValidateError(`Invalid object. (Array)`);
		if (typeof value !== 'object') throw new ValidateError(`Invalid object. (${typeof value})`);
		return value;
	});
}

export function ToEnum<T extends Record<string, string | number>>(enumType: T) {
	const enumMap: Record<string, any> = {};
	const values = Object.values(enumType);
	values.forEach((v: any) => {
		const enumValue = enumType[v];
		if (typeof enumValue === 'number') {
			enumMap[enumValue] = enumValue;
		} else if (typeof v === 'number') {
			enumMap[v] = v;
		} else if (!enumMap[v]) {
			enumMap[v] = v;
		}
	});

	const valuesMap = Object.values(enumMap)
		.map(JSON.stringify as any)
		.join(', ');

	return createValidator((value: any) => {
		if (typeof value !== 'string' && typeof value !== 'number')
			throw new ValidateError(`Invalid value ${value}. Must be one of [${valuesMap}]`);
		const enumValue = enumMap[value];
		if (enumValue == null)
			throw new ValidateError(
				`Value must be one of: [${valuesMap}]. Passed ${JSON.stringify(value)}`
			);
		return value;
	});
}
