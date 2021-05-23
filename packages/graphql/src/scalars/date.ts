import { GraphQLScalarType, Kind } from 'graphql';
import { dateParse, DateTypeInput } from '@rhangai/nest-core';

type CreateDateScalarOptions = {
	name: string;
	description?: string;
	inputFormat: string;
};

export function createDateScalar({ name, description, inputFormat }: CreateDateScalarOptions) {
	return new GraphQLScalarType({
		name,
		description: description || `${name} type`,
		serialize(param: DateTypeInput) {
			const value = dateParse(param, { inputFormat });
			return value.toString();
		},
		parseValue(value) {
			if (typeof value !== 'string') throw new Error(`Invalid value to convert to ${name}.`);
			return dateParse(value, { inputFormat });
		},
		parseLiteral(ast) {
			if (ast.kind !== Kind.STRING) throw new Error(`Invalid literal to convert to ${name}.`);
			return dateParse(ast.value, { inputFormat });
		},
	});
}

export const DateTimeScalar = createDateScalar({
	name: 'DateTime',
	inputFormat: 'YYYY-MM-DD HH:mm:ss',
});

export const DateScalar = createDateScalar({
	name: 'Date',
	inputFormat: 'YYYY-MM-DD',
});

export const TimeScalar = createDateScalar({
	name: 'Time',
	inputFormat: 'HH:mm:ss',
});
