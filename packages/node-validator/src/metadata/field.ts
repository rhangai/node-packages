import { ValidateError } from '../error';
import { IValidator } from '../validator';

export class ValidatorMetadataField {
	private inputFieldName: string | null = null;

	private validator: IValidator | null = null;

	private optional: boolean = false;

	constructor(private readonly fieldName: string | symbol) {}

	validate<T = unknown>(input: any): Promise<T | null> | T | null {
		const value = input[this.inputFieldName ?? this.fieldName];
		if (value == null) {
			if (this.optional) return null;
			throw new ValidateError(`Field is required.`);
		}
		if (this.validator == null) return value;
		return this.validator.validate(value);
	}

	setOptional(optional: boolean) {
		this.optional = !!optional;
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
