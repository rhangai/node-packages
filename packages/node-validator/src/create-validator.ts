import { Class } from './util';
import { ValidatorMetadataClass } from './metadata';
import { IValidator, ValidatorChain, ValidatorFunction } from './validator';

type CreateValidatorFunction = (v: unknown) => unknown;

type CreateValidatorOptions = {
	validate: CreateValidatorFunction;
};

const VALIDATOR_DECORATOR_KEY = Symbol('validator');

export type ValidatorDecorator = {
	(target: any, propertyKey?: string | symbol): void;
	[VALIDATOR_DECORATOR_KEY]: IValidator;
};

export type ValidatorParam =
	| CreateValidatorFunction
	| CreateValidatorOptions
	| IValidator
	| null
	| undefined
	| ValidatorDecorator
	| Array<ValidatorParam>;

export function resolveValidator(validatorParam: ValidatorParam): IValidator | null {
	if (validatorParam == null) return null;
	if (Array.isArray(validatorParam)) {
		const validators = validatorParam.filter(Boolean).map(resolveValidator).filter(Boolean);
		if (validators.length <= 0) return null;
		if (validators.length === 1) return validators[0];

		let chain: IValidator = new ValidatorChain([]);
		validators.forEach((v) => {
			chain = chain.concat(v!);
		});
		return chain;
	} else if (VALIDATOR_DECORATOR_KEY in validatorParam) {
		return (validatorParam as any)[VALIDATOR_DECORATOR_KEY];
	} else if (typeof validatorParam === 'function') {
		return new ValidatorFunction(validatorParam as CreateValidatorFunction);
	} else if (
		typeof validatorParam.validate === 'function' &&
		typeof (validatorParam as any).concat === 'function'
	) {
		return validatorParam as IValidator;
	}
	throw new Error(`Invalid validator`);
}

export function createValidator(validatorParam: ValidatorParam): ValidatorDecorator {
	const validator = resolveValidator(validatorParam);
	const decorator: any = (target: any, propertyKey?: string | symbol): void => {
		if (propertyKey == null) {
			const classStorage = ValidatorMetadataClass.assert(target as Class<any>);
		} else {
			const classStorage = ValidatorMetadataClass.assert(target.constructor as Class<any>);
			classStorage.field(propertyKey as string).appendValidator(validator);
		}
	};
	decorator[VALIDATOR_DECORATOR_KEY] = validator;
	return decorator;
}
