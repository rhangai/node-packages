import { DateType } from '@rhangai/common';
import { ToDate, ToInt, ToString, Validate, validateAsync } from '../src';
import { resolveValidator } from '../src/validator/resolve';

describe('validate', () => {
	describe('#basic', () => {
		class BaseDto {
			@ToString()
			name!: string;

			@ToInt()
			age!: number;

			@Validate()
			anything!: any;
		}

		class ExtendedDto extends BaseDto {
			@ToString()
			extendedName!: string;

			@ToInt()
			anything!: number;
		}

		class InvalidDto {}

		it('should validate a basic dto', async () => {
			const value = {};
			const result = await validateAsync(BaseDto, {
				name: 'test',
				age: '100',
				anything: value,
			});
			expect(result).toEqual({ name: 'test', age: 100, anything: value });
			expect(result.anything).toBe(value);
			expect(result).toBeInstanceOf(BaseDto);
		});

		it('should validate am extended dto', async () => {
			const result = await validateAsync(ExtendedDto, {
				name: 'test',
				age: '100',
				anything: 10,
				extendedName: 'extended',
			});
			expect(result).toEqual({
				name: 'test',
				age: 100,
				anything: 10,
				extendedName: 'extended',
			});
			expect(result).toBeInstanceOf(ExtendedDto);
		});

		it('should not validate invalid inputs', async () => {
			const invalidValues = [
				null,
				{ name: 'test' },
				{ age: 100 },
				{ name: null, age: 10, anything: 100 },
				{ name: 'test', age: null, anything: 100 },
				{ name: 'test', age: 10, anything: null },
			];
			for (const invalidValue of invalidValues) {
				const result = validateAsync(BaseDto, invalidValue as any);
				await expect(result).rejects.toThrow();
			}
		});

		it('should not validate invalid validators', async () => {
			const result = validateAsync(InvalidDto, {});
			await expect(result).rejects.toThrow();
		});
	});

	describe('#async', () => {
		const asyncValidator = resolveValidator(async (v: unknown) => v);
		const Chained = () => Validate([ToInt(), asyncValidator]);
		class AsyncDto {
			@Validate(async (v: unknown) => {
				if (!v) throw new Error('Non null');
				return v;
			})
			value!: any;

			@Chained()
			chained!: any;

			@Validate([
				ToInt(),
				Chained(),
				async (v: unknown) => v,
				asyncValidator,
				ToInt(),
				async (v: unknown) => `v${v}`,
			])
			multichained!: any;
		}

		it('should validate an async function', async () => {
			const value = {};
			const result = validateAsync(AsyncDto, { value, chained: 1, multichained: 10 });
			await expect(result).resolves.toEqual({ value, chained: 1, multichained: 'v10' });
		});

		it('should error on an async function', async () => {
			const result = validateAsync(AsyncDto, {
				value: null,
				chained: null,
				multichained: null,
			});
			await expect(result).rejects.toThrow();
		});
	});
	describe('#chain', () => {
		class ChainDto {
			@Validate()
			@ToString()
			@ToDate()
			@Validate((v: DateType) => v.date())
			chained!: any;
		}

		it('should validate', async () => {
			const result = await validateAsync(ChainDto, {
				chained: '2020-12-31',
			});
			expect(result.chained).toBe(31);
		});

		it('should error on invalid', async () => {
			const result = validateAsync(ChainDto, {
				chained: 'data',
			});
			await expect(result).rejects.toThrow();
		});
	});
});
