import dayjs from 'dayjs';
import { VALIDATOR_SYMBOL_INPUT } from '@rhangai/class-validator';

export type DateTypeInput = string | Date | dayjs.Dayjs | DateType;

export type DateType = dayjs.Dayjs & {
	[VALIDATOR_SYMBOL_INPUT]?: DateTypeInput;
};
