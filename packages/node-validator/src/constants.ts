import type { IValidator } from './validator/validator-interface';

export const VALIDATOR_DECORATOR_KEY = Symbol('validator');
export type ValidatorDecorator = PropertyDecorator & {
	[VALIDATOR_DECORATOR_KEY]: IValidator | null;
};
