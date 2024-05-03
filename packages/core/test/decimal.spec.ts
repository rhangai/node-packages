import { decimalIsValue, decimalParse } from '../src/core/types/decimal';

describe('Decimal', () => {
	it('should operate on decimals', () => {
		const decimal = decimalParse('1000');
		expect(decimal.toNumber()).toBe(1000);
		expect(decimal.toString()).toBe('1000');
		expect(decimal.toFixed(2)).toBe('1000.00');
		expect(decimalIsValue(decimal)).toBe(true);
	});
});
