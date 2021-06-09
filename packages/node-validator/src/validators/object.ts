import { createValidatorDecorator } from '../create-validator';
import { ValidatorMetadataClassStorage } from '../metadata';
import { Class } from '../util';

export function IsObject<T>(target: () => Class<T>) {
	return createValidatorDecorator((value: any) => {
		const validator = ValidatorMetadataClassStorage.get(target());
		if (!validator) return {};
		return validator.validate(value);
	});
}
