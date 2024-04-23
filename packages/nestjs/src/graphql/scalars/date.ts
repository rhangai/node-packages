import { dateParse, type DateTypeInput } from '@rhangai/core';
import { GraphQLScalarType, Kind } from 'graphql';

type CreateDateScalarOptions = {
	name: string;
	description?: string;
	format: string;
};

export function createDateScalar({ name, description, format }: CreateDateScalarOptions) {
	return new GraphQLScalarType({
		name,
		description: description || `${name} type`,
		serialize(param: unknown) {
			const value = dateParse(param, { inputFormat: format });
			return value.format(format);
		},
		parseValue(value) {
			if (!value) return null;
			if (typeof value !== 'string') throw new Error(`Invalid value to convert to ${name}.`);
			return dateParse(value, { inputFormat: format });
		},
		parseLiteral(ast) {
			if (ast.kind !== Kind.STRING) throw new Error(`Invalid literal to convert to ${name}.`);
			if (!ast.value) return null;
			return dateParse(ast.value, { inputFormat: format });
		},
	});
}

export const DateTimeScalar = createDateScalar({
	name: 'DateTime',
	format: 'YYYY-MM-DD HH:mm:ss',
});

export const DateScalar = createDateScalar({
	name: 'Date',
	format: 'YYYY-MM-DD',
});

export const TimeScalar = createDateScalar({
	name: 'Time',
	format: 'HH:mm:ss',
});
