import { decimalIsInput, DecimalInput, decimalParse } from '@rhangai/common';
import { createValidator } from '../create-validator';
import { ValidateError } from '../error';

export type ValidatorToDecimalOptions = {
	min?: DecimalInput;
	max?: DecimalInput;
	allowNegative?: boolean;
};

export function ToDecimal(options?: ValidatorToDecimalOptions) {
	return createValidator((v: unknown) => {
		if (v == null) throw new ValidateError(`${v} cannot be assigned to Decimal`);
		else if (!decimalIsInput(v)) throw new ValidateError(`${v} cannot be assigned to Decimal`);
		const decimalValue = decimalParse(v as DecimalInput);

		if (!options?.allowNegative) {
			if (decimalValue.isLessThan(0))
				throw new ValidateError(`Number must be greater than 0. Passed ${v}`);
		}

		const min = options?.min;
		if (min != null && decimalValue.isLessThan(min))
			throw new ValidateError(`Number must be greater than ${min}. Passed ${v}`);
		const max = options?.max;
		if (max != null && decimalValue.isGreaterThan(max))
			throw new ValidateError(`Number must be smaller than ${max}. Passed ${v}`);

		return decimalValue;
	});
}
