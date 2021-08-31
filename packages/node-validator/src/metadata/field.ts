import { ValidateError } from '../error';
import { IValidator } from '../validator';

export type ValidatorMetadataFieldOptionalOptions = {
	emptyStringAsNull?: boolean;
};

export class ValidatorMetadataField {
	private inputFieldName: string | null = null;

	private validator: IValidator | null = null;

	private optional: ValidatorMetadataFieldOptionalOptions | null = null;

	constructor(private readonly fieldName: string | symbol) {}

	validate<T = unknown>(input: any): Promise<T | null> | T | null {
		const value = input[this.inputFieldName ?? this.fieldName];
		if (value == null) {
			if (this.optional) return null;
			throw new ValidateError(`Field is required.`);
		} else if (
			this.optional?.emptyStringAsNull &&
			typeof value === 'string' &&
			value.trim() === ''
		) {
			return null;
		}
		if (this.validator == null) return value;
		return this.validator.validate(value);
	}

	setOptional(options: ValidatorMetadataFieldOptionalOptions) {
		this.optional = options;
	}

	appendValidator(validator: IValidator | null) {
		if (!validator) return;
		if (this.validator == null) {
			this.validator = validator;
		} else {
			this.validator = this.validator.concat(validator);
		}
	}

	prependValidator(validator: IValidator | null) {
		if (!validator) return;
		if (this.validator == null) {
			this.validator = validator;
		} else {
			this.validator = validator.concat(this.validator);
		}
	}
}
