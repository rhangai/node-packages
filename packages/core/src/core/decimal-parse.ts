import type { Result } from './result';
import { Decimal } from './decimal-type';

/**
 * Safely parses a decimal
 */
export function decimalSafeParse(param: unknown): Result<Decimal> {
	let decimal: Decimal | undefined;
	if (typeof param === 'number') {
		decimal = new Decimal(param);
	} else if (typeof param === 'string') {
		decimal = new Decimal(param, 10);
	} else if (Decimal.isBigNumber(param)) {
		decimal = param;
	}
	if (!decimal || !decimal.isFinite()) {
		return {
			success: false,
			error: `Invalid decimal: ${param}`,
		};
	}
	return {
		success: true,
		value: decimal,
	};
}

/**
 * Parses a decimal. Throwing errors
 */
export function decimalParse(param: unknown): Decimal {
	const { success, value, error } = decimalSafeParse(param);
	if (!success) throw new Error(error ?? `Invalid decimal: ${param}`);
	return value;
}
