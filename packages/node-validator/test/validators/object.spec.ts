/* eslint-disable no-await-in-loop */
import { Decimal } from '@rhangai/common';
import {
	validate,
	validateValue,
	IsObject,
	ToString,
	ToEnum,
	validateValueAsync,
	ClassValidate,
	ValidateError,
	IsOptional,
	IsAnyObject,
	validateAsync,
} from '../../src';

describe('IsObject', () => {
	describe('#normal', () => {
		@ClassValidate<BasicDto>((obj) => {
			if (obj.name === 'InvalidName') throw new ValidateError(`Invalid name`);
			return obj;
		})
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
				const result = await validateValue(input as any, rules);
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
				{ name: 'InvalidName' },
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

	describe('#optional', () => {
		class BasicDto {
			@ToString()
			name!: string;

			@IsOptional({ emptyStringAsNull: true })
			@ToString()
			notes!: string;
		}
		const rules = [IsObject(() => BasicDto)];
		it('should validate valid objects', async () => {
			const values = [
				[
					{ name: 'name', notes: '' },
					{ name: 'name', notes: null },
				],
				[
					{ name: 'name', notes: null },
					{ name: 'name', notes: null },
				],
				[
					{ name: 'name', notes: 'value' },
					{ name: 'name', notes: 'value' },
				],
				[{ name: 'name' }, { name: 'name', notes: null }],
			];
			for (const [input, expected] of values) {
				const result = await validateValue(input as any, rules);
				expect(result).toEqual(expected);
			}
		});
	});
});
describe('IsAnyObject', () => {
	describe('#normal', () => {
		class BasicDto {
			@IsAnyObject()
			value!: Record<string, unknown>;
		}
		it('should validate valid objects', async () => {
			const values = [
				//
				{},
				{ a: 100, b: 200 },
			];
			for (const input of values) {
				const result = await validate(BasicDto, { value: input });
				expect(result.value).toStrictEqual(input);
			}
		});
		it('should not validate non objects', async () => {
			const values = [
				//
				null,
				[],
				[1, 2, 3],
				Symbol(''),
			];
			for (const input of values) {
				const result = validateAsync(BasicDto, { value: input });
				await expect(result).rejects.toThrow();
			}
		});
	});
});

describe('ToEnum', () => {
	describe('#normal', () => {
		const testEnum = async (enumType: any, valid: unknown[], invalid: unknown[]) => {
			const rules = [ToEnum(enumType)];
			for (const validValue of valid) {
				const result = await validateValue(validValue, rules);
				expect(result).toBeDefined();
			}
			for (const invalidValue of invalid) {
				const result = validateValueAsync(invalidValue, rules);
				await expect(result).rejects.toThrow();
			}
		};

		it('should validate basic numeric enums', async () => {
			enum BasicEnum {
				SOMETHING = 0,
				OTHER = 1,
			}
			const validValues = [0, 1];
			const invalidValues = ['SOMETHING', 'OTHER', 2, -1];
			await testEnum(BasicEnum, validValues, invalidValues);
		});

		it('should validate string enums', async () => {
			enum StringEnum {
				SOMETHING = 'something-value',
				OTHER = 'other-value',
			}
			const validValues = ['something-value', 'other-value'];
			const invalidValues = ['SOMETHING', 'OTHER', 2, -1];
			await testEnum(StringEnum, validValues, invalidValues);
		});

		it('should validate mixed enums', async () => {
			enum MixedEnum {
				SOMETHING = 0,
				OTHER = 'other-value',
			}

			const validValues = [0, 'other-value'];
			const invalidValues = ['SOMETHING', 'OTHER', 2, -1];
			await testEnum(MixedEnum, validValues, invalidValues);
		});
	});
});
