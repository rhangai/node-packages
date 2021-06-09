import { GraphQLScalarType, Kind } from 'graphql';
import { Decimal, DecimalInput, decimalParse } from '@rhangai/nest-core';

export const DecimalScalar = new GraphQLScalarType({
	name: 'Decimal',
	description: 'Decimal type',
	serialize(param: DecimalInput) {
		const value = decimalParse(param);
		return value.toString();
	},
	parseValue(value) {
		if (typeof value !== 'string') throw new Error(`Invalid value to convert to Decimal.`);
		return new Decimal(value, 10);
	},
	parseLiteral(ast) {
		if (ast.kind !== Kind.STRING) throw new Error(`Invalid literal to convert to Decimal.`);
		return new Decimal(ast.value, 10);
	},
});
