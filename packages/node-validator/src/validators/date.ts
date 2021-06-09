import { dateIsInput, DateTypeInput, dateParse, DateType } from '@rhangai/common';
import { createValidator } from '../create-validator';
import { ValidateError } from '../error';

export type ValidatorToDateOptions = {
	test?: (date: DateType) => boolean;
	inputFormat?: string;
};

export function ToDate(options?: ValidatorToDateOptions) {
	const inputFormat = options?.inputFormat ?? 'YYYY-MM-DD';
	return createValidator((v: unknown) => {
		if (v == null) throw new ValidateError(`${v} cannot be assigned to Date`);
		else if (!dateIsInput(v)) throw new ValidateError(`${v} cannot be assigned to Date`);
		const dateValue = dateParse(v as DateTypeInput, { inputFormat });
		const test = options?.test;
		if (test != null) {
			const isValid = test(dateValue);
			if (!isValid) throw new ValidateError(`Invalid Date`);
		}
		return dateValue;
	});
}
