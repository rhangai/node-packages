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
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		'no-console': 'warn',
		'object-shorthand': 'warn',
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
		'n/prefer-node-protocol': 'warn',
	},
	js: {
		'prefer-destructuring': 'warn',
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
	},
	ts: {
		'@typescript-eslint/consistent-type-definitions': 'off',
		'@typescript-eslint/switch-exhaustiveness-check': ['warn'],
		'@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
		'@typescript-eslint/no-non-null-assertion': 'warn',
		// Rules that conflicts with default js
		'prefer-destructuring': 'off',
		'@typescript-eslint/prefer-destructuring': [
			'warn',
			{ VariableDeclarator: { object: true } },
		],
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
