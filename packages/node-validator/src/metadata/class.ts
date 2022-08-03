import { ValidateError } from '../error';
import { Class, isPromiseLike } from '../util';
import { IValidator } from '../validator';
import { ValidatorMetadataField } from './field';

const VALIDATOR_METADATA_CLASS_STORAGE_KEY = Symbol('@rhangai/validator(class-storage)');

type ValidatorMetadataClassValidateState = {
	result: Record<string, unknown>;
	errorMap: Record<string, Error>;
	promises: Array<Promise<void>>;
	fields: Record<string, true>;
};

export class ValidatorMetadataClass<T> {
	public readonly fields: Record<string | symbol, ValidatorMetadataField> = {};

	public classValidator: IValidator | null = null;

	constructor(public readonly classType: Class<T>) {}

	field(fieldName: string | symbol): ValidatorMetadataField {
		let field = this.fields[fieldName as any];
		if (!field) {
			field = new ValidatorMetadataField(fieldName);
			this.fields[fieldName as any] = field;
		}
		return field;
	}

	addClassValidator(classValidator: IValidator): void {
		if (this.classValidator) {
			this.classValidator = this.classValidator.concat(classValidator);
		} else {
			this.classValidator = classValidator;
		}
	}

	validate(input: unknown): T | Promise<T> {
		if (input == null || typeof input !== 'object' || Array.isArray(input)) {
			throw new ValidateError(`${input} cannot be converted to ${this.classType.name}`);
		}
		const state: ValidatorMetadataClassValidateState = {
			result: {},
			errorMap: {},
			promises: [],
			fields: {},
		};
		this.validateState(input, state);
		const parentClass = Object.getPrototypeOf(this.classType);
		if (parentClass) {
			const parentClassMetadata = ValidatorMetadataClass.get(parentClass);
			if (parentClassMetadata) {
				parentClassMetadata.validateState(input, state);
			}
		}

		const getOutput = () => {
			if (Object.keys(state.errorMap).length > 0)
				throw new ValidateError(`Error validating ${this.classType.name}`, state.errorMap);
			const result = Object.setPrototypeOf(state.result, this.classType.prototype) as T;
			if (this.classValidator == null) return result;
			return this.classValidator.validate(result) as T | Promise<T>;
		};
		if (state.promises.length > 0) {
			return Promise.all(state.promises).then(getOutput);
		}
		return getOutput();
	}

	validateState(input: unknown, stateParam: ValidatorMetadataClassValidateState): void {
		const state = stateParam;
		Object.keys(this.fields).forEach((fieldName) => {
			if (state.fields[fieldName]) return;
			const field = this.fields[fieldName];
			state.fields[fieldName] = true;
			let result: unknown;
			try {
				result = field.validate(input);
			} catch (err) {
				state.errorMap[fieldName] = err as any;
				return;
			}
			if (isPromiseLike(result)) {
				state.promises.push(
					result.then(
						(r) => {
							state.result[fieldName] = r;
						},
						(err) => {
							state.errorMap[fieldName] = err;
						}
					)
				);
			} else {
				state.result[fieldName] = result;
			}
		});
	}

	static assert<T>(classType: Class<T>): ValidatorMetadataClass<T> {
		let metadataStorage = this.get(classType);
		if (!metadataStorage) {
			metadataStorage = new ValidatorMetadataClass(classType);
			Reflect.defineMetadata(
				VALIDATOR_METADATA_CLASS_STORAGE_KEY,
				metadataStorage,
				classType
			);
		}
		return metadataStorage;
	}

	static get<T>(classType: Class<T>): ValidatorMetadataClass<T> | null {
		const metadataStorage = Reflect.getOwnMetadata(
			VALIDATOR_METADATA_CLASS_STORAGE_KEY,
			classType
		);
		if (!metadataStorage) return null;
		return metadataStorage;
	}
}
