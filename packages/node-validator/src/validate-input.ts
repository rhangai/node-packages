import type { DateType, DateTypeInput, Decimal, DecimalInput } from '@rhangai/common';

export const VALIDATE_INPUT_TAG = Symbol('@rhangai/validator(tag)');

type ValidateInputObject<T extends Record<string, unknown>> = {
	[K in keyof T]: ValidateInput<T[K]>;
};

type ValidateInputTagged<T> = {
	[VALIDATE_INPUT_TAG]?: T;
};

// prettier-ignore
export type ValidateInput<T> =
	T extends string | number ? T | string | number :
	T extends DateType ? DateTypeInput :
	T extends Decimal ? DecimalInput :
	T extends ValidateInputTagged<infer U> ? ValidateInput<U> :
	T extends Record<string, any> ? ValidateInputObject<T> :
	T extends Array<infer U> ? Array<ValidateInput<U>> :
	T extends ReadonlyArray<infer U> ? Array<ValidateInput<U>> :
	T;
