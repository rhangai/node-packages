import type { Result } from '../result';
import { BigNumber } from 'bignumber.js';

/// Decimal type
export type Decimal = BigNumber;
/// Decimal value
export const Decimal = BigNumber.clone();

/**
 * Check if it is a decimal type
 */
export function decimalIsValue(v: unknown): v is Decimal {
	return Decimal.isBigNumber(v);
}

/// Decimal input type
export type DecimalInput = string | BigNumber | number;

/**
 * Check if is a decimal input type
 */
export function decimalIsInput(v: unknown): v is DecimalInput {
	if (typeof v === 'string') return true;
	if (typeof v === 'number') return true;
	return Decimal.isBigNumber(v);
}

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

/**
 * Parses a decimal or return an specific value
 */
export function decimalParseOr(param: unknown, defaultValue: number): Decimal;
export function decimalParseOr(param: unknown, defaultValue: null): Decimal | null;
export function decimalParseOr(param: unknown, defaultValue: number | null): Decimal | null {
	const { success, value } = decimalSafeParse(param);
	if (!success) {
		return defaultValue == null ? null : new Decimal(defaultValue);
	}
	return value;
}
