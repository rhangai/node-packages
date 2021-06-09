export interface IValidator {
	concat(other: IValidator): IValidator;

	validate<T>(value: unknown): T | Promise<T>;
}
