import { GraphQLScalarType, Kind } from 'graphql';
import { intParse } from '@rhangai/core';

export const StringIntScalar = new GraphQLScalarType({
	name: 'StringInt',
	description: 'StringInt type',
	serialize(value: unknown) {
		if (value == null) {
			return null;
		}
		return intParse(value);
	},
	parseValue(value) {
		if (value == null) {
			return null;
		}
		return intParse(value);
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
			return intParse(ast.value);
		}
		throw new Error(`Literal cannot be converted to Int.`);
	},
});
