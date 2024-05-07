import { type Config as ConfigFile } from 'typescript-eslint';

type ExtractConfig<T> = T extends Array<infer U> ? U : never;
export type EslintConfig = ExtractConfig<ConfigFile>;
export type EslintConfigRules = NonNullable<EslintConfig['rules']>;
