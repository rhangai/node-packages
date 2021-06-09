import { createValidator } from '../create-validator';
import { ValidatorMetadataClass } from '../metadata';
import { Class } from '../util';

export function IsObject<T>(target: () => Class<T>) {
	return createValidator((value: any) => {
		const validator = ValidatorMetadataClass.get(target());
		if (!validator) return {};
		return validator.validate(value);
	});
}
