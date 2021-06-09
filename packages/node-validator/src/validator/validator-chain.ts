import { isPromiseLike } from '../util';
import { IValidator } from './validator-interface';

export class ValidatorChain implements IValidator {
	constructor(private readonly validators: IValidator[] = []) {}

	concat(other: IValidator): IValidator {
		if (other instanceof ValidatorChain) {
			this.validators.unshift(...other.validators);
		} else {
			this.validators.unshift(other);
		}
		return this;
	}

	validate<T>(valueParam: unknown): T | Promise<T> {
		let value = valueParam;
		for (let i = 0; i < this.validators.length; ++i) {
			value = this.validators[i].validate(value);
			if (isPromiseLike(value)) {
				return this.validatePromise(value, i + 1);
			}
		}
		return value as T;
	}

	private async validatePromise<T>(valueParam: Promise<unknown>, index: number): Promise<T> {
		if (index >= this.validators.length - 1) {
			return valueParam as Promise<T>;
		}
		let value = await valueParam;
		for (let i = index; i < this.validators.length; ++i) {
			value = await this.validators[i].validate(value);
		}
		return value as T;
	}
}
