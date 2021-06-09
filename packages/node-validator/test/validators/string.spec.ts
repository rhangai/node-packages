import { Decimal } from '@rhangai/common';
import { validateValue, ToString } from '../../src';

describe('string', () => {
	describe('#ToString', () => {
		const rules = [ToString()];
		it('should validate valid strings', async () => {
			const values = [
				['test', 'test'],
				['test              space', 'test space'],
				['               trim', 'trim'],
				['trim                ', 'trim'],
			];
			for (const [input, expected] of values) {
				const result = await validateValue<string>(input, rules);
				expect(result).toBe(expected);
			}
		});
		it('should not validate invalid strings', async () => {
			const invalidValues = [null, undefined, new Date(), Symbol(''), new Decimal(100)];
			for (const value of invalidValues) {
				const result = (async () => validateValue<string>(value as any, rules))();
				await expect(result).rejects.toThrowError();
			}
		});
	});
});
