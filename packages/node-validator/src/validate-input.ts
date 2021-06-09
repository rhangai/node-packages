import type { DateType, DateTypeInput, Decimal, DecimalInput } from '@rhangai/common';

type ValidateInputObject<T extends Record<string, unknown>> = {
	readonly [K in keyof T]: ValidateInput<T[K]>;
};

// prettier-ignore
export type ValidateInput<T> =
	T extends string | number ? string | number :
	T extends DateType ? DateTypeInput :
	T extends Decimal ? DecimalInput :
	T extends Record<string, any> ? ValidateInputObject<T> :
	T extends Array<infer U> ? ReadonlyArray<ValidateInput<U>> :
	T extends ReadonlyArray<infer U> ? ReadonlyArray<ValidateInput<U>> :
	T;
