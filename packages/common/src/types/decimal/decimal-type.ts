import { BigNumber } from 'bignumber.js';

export type DecimalInput = string | BigNumber | number;
export type Decimal = BigNumber;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Decimal = BigNumber.clone();

export function decimalIsValue(v: unknown): v is Decimal {
	return Decimal.isBigNumber(v);
}

export function decimalIsInput(v: unknown): v is DecimalInput {
	if (typeof v === 'string') return true;
	if (typeof v === 'number') return true;
	return Decimal.isBigNumber(v);
}
