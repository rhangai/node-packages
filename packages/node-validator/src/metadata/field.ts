import { IValidator } from '../validator';

export class ValidatorMetadataField {
	private inputFieldName: string | null = null;

	private validator: IValidator | null = null;

	constructor(private readonly fieldName: string | symbol) {}

	validate<T = unknown>(input: any): Promise<T> | T {
		const value = input[this.inputFieldName ?? this.fieldName];
		if (this.validator == null) return value;
		return this.validator.validate(value);
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
