import { ValidateError } from '../error';
import { Class, isPromiseLike } from '../util';
import { ValidatorMetadataFieldStorage } from './field-storage';

const VALIDATOR_METADATA_CLASS_STORAGE_KEY = Symbol('@rhangai/validator(class-storage)');

export class ValidatorMetadataClassStorage<T> {
	public readonly fields: Record<string, ValidatorMetadataFieldStorage> = {};

	constructor(public readonly classType: Class<T>) {}

	field(fieldName: string): ValidatorMetadataFieldStorage {
		let field = this.fields[fieldName];
		if (!field) {
			field = new ValidatorMetadataFieldStorage(fieldName);
			this.fields[fieldName] = field;
		}
		return field;
	}

	validate(input: unknown): T | Promise<T> {
		if (input == null || typeof input !== 'object' || Array.isArray(input)) {
			throw new ValidateError(`${input} cannot be converted to ${this.classType.name}`);
		}
		const output: Record<string, unknown> = {};
		const errors: Record<string, Error> = {};
		const promises: Promise<any>[] = [];
		// eslint-disable-next-line guard-for-in
		for (const fieldName in this.fields) {
			const field = this.fields[fieldName];
			let result: unknown;
			try {
				result = field.validate(input);
			} catch (err) {
				errors[fieldName] = err;
				continue;
			}
			if (isPromiseLike(result)) {
				promises.push(
					result.then(
						(r) => {
							output[fieldName] = r;
						},
						(err) => {
							errors[fieldName] = err;
						}
					)
				);
			} else {
				output[fieldName] = result;
			}
		}
		const getOutput = () => {
			if (Object.keys(errors).length > 0)
				throw new ValidateError(`Error validating ${this.classType.name}`, errors);
			return Object.setPrototypeOf(output, this.classType.prototype) as T;
		};
		if (promises.length > 0) {
			return Promise.all(promises).then(getOutput);
		}
		return getOutput();
	}

	static assert<T>(classType: Class<T>): ValidatorMetadataClassStorage<T> {
		let metadataStorage = this.get(classType);
		if (!metadataStorage) {
			metadataStorage = new ValidatorMetadataClassStorage(classType);
			Reflect.defineMetadata(
				VALIDATOR_METADATA_CLASS_STORAGE_KEY,
				metadataStorage,
				classType
			);
		}
		return metadataStorage;
	}

	static get<T>(classType: Class<T>): ValidatorMetadataClassStorage<T> | null {
		const metadataStorage = Reflect.getOwnMetadata(
			VALIDATOR_METADATA_CLASS_STORAGE_KEY,
			classType
		);
		if (!metadataStorage) return null;
		return metadataStorage;
	}
}
