import { Decimal } from '@rhangai/common';
import { validateValue, IsObject, ToString } from '../../src';

describe('IsObject', () => {
	describe('#normal', () => {
		class BasicDto {
			@ToString()
			name!: string;
		}
		const rules = [IsObject(() => BasicDto)];
		it('should validate valid objects', async () => {
			const values = [
				[{ name: 'name' }, { name: 'name' }],
				[{ name: 'name', extra: '' }, { name: 'name' }],
			];
			for (const [input, expected] of values) {
				const result = await validateValue(input, rules);
				expect(result).toEqual(expected);
			}
		});
		it('should not validate invalid objects', async () => {
			const invalidValues = [
				null,
				undefined,
				new Date(),
				Symbol(''),
				new Decimal(100),
				'test',
				'201x',
				{ nombre: '' },
			];
			for (const value of invalidValues) {
				const result = (async () => validateValue(value as any, rules))();
				await expect(result).rejects.toThrowError();
			}
		});

		it('should not validate invalid object definitions', async () => {
			class InvalidClass {}

			const invalidClassRules = [IsObject(() => InvalidClass)];
			const result = (async () => validateValue({}, invalidClassRules))();
			await expect(result).rejects.toThrowError();
		});
	});
});
