import { VALIDATOR_SYMBOL_INPUT } from '@rhangai/class-validator';
import { BigNumber } from 'bignumber.js';

export type DecimalInput = string | BigNumber | number;
export type Decimal = BigNumber & {
	[VALIDATOR_SYMBOL_INPUT]?: DecimalInput;
};
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const Decimal = BigNumber.clone();
