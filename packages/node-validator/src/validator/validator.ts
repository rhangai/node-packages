import { ValidatorChain } from './validator-chain';
import { IValidator } from './validator-interface';

export class ValidatorFunction implements IValidator {
	constructor(private readonly validateFunction: (value: unknown) => unknown) {}

	concat(other: IValidator): IValidator {
		const chain = new ValidatorChain([this]);
		return chain.concat(other);
	}

	validate<T>(value: unknown): T | Promise<T> {
		return this.validateFunction(value) as T | Promise<T>;
	}
}
