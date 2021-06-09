import { Decimal } from '@rhangai/common';
import { validateValue, ToInt } from '../../src';

describe('ToInt', () => {
	describe('#normal', () => {
		const rules = [ToInt()];
		it('should validate valid numbers', async () => {
			const values = [
				[1, 1],
				[100, 100],
				['100', 100],
				['-10', -10],
				[-1, -1],
			];
			for (const [input, expected] of values) {
				const result = await validateValue(input, rules);
				expect(result).toBe(expected);
			}
		});
		it('should not validate invalid numbers', async () => {
			const invalidValues = [
				null,
				undefined,
				new Date(),
				Symbol(''),
				new Decimal(100),
				'test',
				'201x',
			];
			for (const value of invalidValues) {
				const result = (async () => validateValue(value as any, rules))();
				await expect(result).rejects.toThrowError();
			}
		});
	});

	describe('#options', () => {
		const rules = [ToInt({ min: 5, max: 200 })];
		it('should validate valid numbers', async () => {
			const values = [
				[5, 5],
				[200, 200],
				[123, 123],
				['100', 100],
				['21', 21],
			];
			for (const [input, expected] of values) {
				const result = await validateValue(input, rules);
				expect(result).toBe(expected);
			}
		});
		it('should not validate invalid numbers', async () => {
			const invalidValues = [
				null,
				undefined,
				new Date(),
				Symbol(''),
				new Decimal(100),
				'test',
				-1000,
				0,
				4,
				201,
				'201',
			];
			for (const value of invalidValues) {
				const result = (async () => validateValue(value as any, rules))();
				await expect(result).rejects.toThrowError();
			}
		});
	});
});
