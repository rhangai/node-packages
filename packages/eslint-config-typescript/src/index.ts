/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
// @ts-expect-error ESLint padrão não tem tipos
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
// @ts-expect-error eslint-plugin-import não tem tipos
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginN from 'eslint-plugin-n';
import type { EslintConfig } from './types';

// Extensions for files
const JS_EXTENSIONS = ['.js', '.jsx', '.mjs', '.cjs'];
const TS_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts'];
const EXTENSIONS = [...TS_EXTENSIONS, ...JS_EXTENSIONS];

// Common rules
const RULES = {
	base: {
		// ESLINT default rules
		'arrow-body-style': 'warn',
		camelcase: 'warn',
		curly: ['warn', 'all'],
		'dot-notation': 'warn',
		'default-case': 'warn',
		'default-case-last': 'error',
		eqeqeq: [
			'warn',
			'always',
			{
				null: 'ignore',
			},
		],
		'default-param-last': 'error',
		'guard-for-in': 'warn',
		'no-console': 'warn',
		'no-constructor-return': 'error',
		'no-else-return': 'warn',
		'no-iterator': 'error',
		'no-lonely-if': 'error',
		'no-loop-func': 'error',
		'no-promise-executor-return': 'error',
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		'no-proto': 'error',
		'no-return-assign': 'error',
		'no-sequences': 'error',
		'no-unmodified-loop-condition': 'error',
		'no-useless-assignment': 'error',
		'object-shorthand': 'warn',
		'prefer-const': 'warn',
		'prefer-promise-reject-errors': 'error',
		// eslint-plugin-import
		'import/no-cycle': 'error',
		'import/no-extraneous-dependencies': [
			'error',
			{
				devDependencies: [
					'eslint.config.*',
					'**/*.test.*',
					'**/*.spec.*',
					'**/spec/**/*',
					'**/test/**/*',
				],
			},
		],
		'import/order': [
			'error',
			{
				groups: [
					//
					'builtin',
					'external',
					'internal',
					'parent',
					'sibling',
					'index',
				],
				pathGroups: [
					{
						pattern: '@nestjs/common',
						group: 'external',
						position: 'before',
					},
					{
						pattern: '@nestjs/core',
						group: 'external',
						position: 'before',
					},
					{
						pattern: '@nestjs/*',
						group: 'external',
						position: 'before',
					},
				],
				pathGroupsExcludedImportTypes: ['builtin'],
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
			},
		],
		// eslint-plugin-n
		'n/prefer-node-protocol': 'warn',
	},
	js: {
		// Only JS
		'no-duplicate-imports': 'error',
		// Conflicts with typescript
		'consistent-return': 'warn',
		'no-shadow': 'error',
		'no-unused-vars': [
			'warn',
			{
				args: 'after-used',
				argsIgnorePattern: '^_',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_',
				destructuredArrayIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			},
		],
		'prefer-destructuring': 'warn',
	},
	ts: {
		// typescript-eslint
		'@typescript-eslint/consistent-type-definitions': 'off',
		'@typescript-eslint/switch-exhaustiveness-check': ['warn'],
		'@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
		'@typescript-eslint/no-non-null-assertion': 'warn',
		// Rules that does not work on ts
		'no-duplicate-imports': 'off',
		// Rules that conflicts with default eslint
		'consistent-return': 'off',
		'@typescript-eslint/consistent-return': 'warn',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				args: 'after-used',
				argsIgnorePattern: '^_',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_',
				destructuredArrayIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			},
		],
		'prefer-destructuring': 'off',
		'@typescript-eslint/prefer-destructuring': [
			'warn',
			{ VariableDeclarator: { object: true } },
		],
	},
} satisfies Record<string, EslintConfig['rules']>;

type Config = {
	ts: EslintConfig[];
};

const eslintConfigRecommended: EslintConfig = eslint.configs.recommended;
const config: Config = {
	ts: [
		eslintConfigRecommended,
		...tseslint.configs.strictTypeChecked,
		...tseslint.configs.stylisticTypeChecked,
		{
			name: '@rhangai/esling-config-typescript/ts',
			plugins: {
				n: eslintPluginN,
				import: eslintPluginImport,
			},
			rules: {
				...RULES.base,
				...RULES.ts,
			},
			settings: {
				'import/extensions': EXTENSIONS,
				'import/external-module-folders': ['node_modules', 'node_modules/@types'],
				'import/parsers': {
					'@typescript-eslint/parser': TS_EXTENSIONS,
				},
				'import/resolver': {
					node: {
						extensions: EXTENSIONS,
					},
				},
			},
		},
		{
			...tseslint.configs.disableTypeChecked,
			name: '@rhangai/esling-config-typescript/ts-js',
			files: [`**/*.{${JS_EXTENSIONS.map((e) => e.substring(1)).join(',')}}`],
			rules: {
				...tseslint.configs.disableTypeChecked.rules,
				...RULES.js,
			},
		},
	],
};

export default config;
