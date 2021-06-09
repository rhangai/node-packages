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
