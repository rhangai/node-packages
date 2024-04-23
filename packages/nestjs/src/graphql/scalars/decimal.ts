import { Decimal, decimalParse } from '@rhangai/common';
import { GraphQLScalarType, Kind } from 'graphql';

export const DecimalScalar = new GraphQLScalarType({
	name: 'Decimal',
	description: 'Decimal type',
	serialize(param: unknown) {
		const value = decimalParse(param);
		return value.toFixed();
	},
	parseValue(value) {
		if (!value) return null;
		if (typeof value !== 'string') throw new Error(`Invalid value to convert to Decimal.`);
		return new Decimal(value, 10);
	},
	parseLiteral(ast) {
		if (ast.kind !== Kind.STRING) throw new Error(`Invalid literal to convert to Decimal.`);
		if (ast.value === '') return null;
		return new Decimal(ast.value, 10);
	},
});
