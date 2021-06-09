import { createValidatorDecorator } from '../create-validator';
import { Class } from '../util';
import { validate } from '../validate';

export function IsObject<T>(target: () => Class<T>) {
	return createValidatorDecorator((value: any) => validate(target(), value));
}
