import { Class } from '../util';
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
