import { ValidatorDecorator, VALIDATOR_DECORATOR_KEY } from '../constants';
import { ValidatorFunction } from './validator';
import { ValidatorChain } from './validator-chain';
import { IValidator } from './validator-interface';

type CreateValidatorFunction = (v: unknown) => unknown;

type CreateValidatorOptions = {
	validate: CreateValidatorFunction;
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
	} else if (isValidatorDecorator(validatorParam)) {
		return validatorParam[VALIDATOR_DECORATOR_KEY];
	} else if (isValidator(validatorParam)) {
		return validatorParam;
	} else if (typeof validatorParam === 'function') {
		return new ValidatorFunction(validatorParam);
	}
	throw new Error(`Invalid validator`);
}

function isValidator(param: any): param is IValidator {
	return typeof param.validate === 'function' && typeof param.concat === 'function';
}

function isValidatorDecorator(param: any): param is ValidatorDecorator {
	return VALIDATOR_DECORATOR_KEY in param;
}
