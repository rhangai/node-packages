import { GraphQLScalarType, Kind } from 'graphql';
import { dateParse, type DateType } from '@rhangai/core';

type CreateDateScalarOptions = {
	name: string;
	description?: string;
	format: string;
	serialize?: (date: DateType) => string;
};

export function createDateScalar({
	name,
	description,
	format,
	serialize,
}: CreateDateScalarOptions): GraphQLScalarType<DateType | null, string> {
	return new GraphQLScalarType({
		name,
		description: description || `${name} type`,
		serialize(param: unknown) {
			const value = dateParse(param, { inputFormat: format });
			return serialize ? serialize(value) : value.format(format);
		},
		parseValue(value) {
			if (!value) {
				return null;
			}
			if (typeof value !== 'string') {
				throw new Error(`Invalid value to convert to ${name}.`);
			}
			return dateParse(value, { inputFormat: format });
		},
		parseLiteral(ast) {
			if (ast.kind !== Kind.STRING) {
				throw new Error(`Invalid literal to convert to ${name}.`);
			}
			if (!ast.value) {
				return null;
			}
			return dateParse(ast.value, { inputFormat: format });
		},
	});
}

export const DateTimeScalar: GraphQLScalarType<DateType | null, string> = createDateScalar({
	name: 'DateTime',
	format: 'YYYY-MM-DD HH:mm:ss',
	serialize(date: DateType & { utc?(): DateType }) {
		if (date.utc) {
			return date.utc().toISOString();
		}
		return date.toISOString();
	},
});

export const DateScalar: GraphQLScalarType<DateType | null, string> = createDateScalar({
	name: 'Date',
	format: 'YYYY-MM-DD',
});

export const TimeScalar: GraphQLScalarType<DateType | null, string> = createDateScalar({
	name: 'Time',
	format: 'HH:mm:ss',
});
