import type { Config as ConfigFile } from 'typescript-eslint';

type ExtractConfig<T> = T extends (infer U)[] ? U : never;
export type EslintConfig = ExtractConfig<ConfigFile>;
