import { GraphQLScalarType, Kind } from 'graphql';

export const StringIntScalar = new GraphQLScalarType({
	name: 'StringInt',
	description: 'StringInt type',
	serialize(value: string | number) {
		if (value == null) return null;
		return integerParse(value);
	},
	parseValue(value) {
		if (value == null) return null;
		return integerParse(value);
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
			return integerParse(ast.value);
		}
		throw new Error(`Literal cannot be converted to Int.`);
	},
});

function integerParse(value: any): number {
	let intValue = value;
	if (typeof intValue === 'string') {
		intValue = parseInt(intValue, 10);
	}
	if (typeof intValue !== 'number' && !Number.isInteger(intValue))
		throw new Error(`${value} cannot be converted to Int`);
	return intValue;
}
