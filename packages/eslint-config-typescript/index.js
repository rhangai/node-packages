const { extensions, createNoExtraneousDependenciesOptions } = require('./util');

module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	extends: [
		'eslint-config-airbnb-base',
		'plugin:prettier/recommended',
		'plugin:import/typescript',
	],
	settings: {
		'import/extensions': extensions,
		'import/external-module-folders': ['node_modules', 'node_modules/@types'],
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.mts', '.cts', '.tsx', '.mtsx', '.ctsx'],
		},
		'import/resolver': {
			typescript: {},
			node: { extensions },
		},
	},
	rules: {
		curly: 'off',
		'class-methods-use-this': 'off',
		'function-paren-newline': 'off',
		'implicit-arrow-linebreak': 'off',
		'max-classes-per-file': 'off',
		'no-await-in-loop': 'off',
		'no-continue': 'off',
		'no-else-return': ['error', { allowElseIf: true }],
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		'no-restricted-syntax': ['error', 'WithStatement', 'LabeledStatement'],
		'no-tabs': 'off',
		'no-void': ['error', { allowAsStatement: true }],
		'nonblock-statement-body-position': 'off',
		'object-curly-newline': 'off',
		'prefer-destructuring': ['error', { VariableDeclarator: { object: true } }],
		...createTypescriptRules({
			'no-empty-function': ['warn'],
			'no-redeclare': ['error'],
			'no-shadow': ['error'],
			'no-unused-expressions': [
				'error',
				{
					allowTernary: true,
				},
			],
			'no-useless-constructor': ['error'],
			'no-use-before-define': [
				'error',
				{
					functions: false,
					classes: false,
					variables: true,
					enums: false,
					typedefs: false,
					ignoreTypeReferences: true,
				},
			],
			'no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					caughtErrors: 'none',
					ignoreRestSiblings: true,
				},
			],
		}),
		'@typescript-eslint/no-floating-promises': 'error',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/switch-exhaustiveness-check': 'error',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		'@typescript-eslint/no-confusing-non-null-assertion': 'warn',
		'@typescript-eslint/no-base-to-string': 'warn',
		'@typescript-eslint/no-misused-promises': 'error',
		'@typescript-eslint/no-unnecessary-condition': [
			'error',
			{
				allowConstantLoopConditions: false,
			},
		],
		'import/prefer-default-export': 'off',
		'import/extensions': [
			'error',
			'always',
			{
				ignorePackages: true,
				pattern: {
					js: 'never',
					jsx: 'never',
					ts: 'never',
					tsx: 'never',
					cts: 'never',
					mts: 'never',
				},
			},
		],
		'import/no-unresolved': [
			'error',
			{
				ignore: ['^@@', '^~', '^virtual:'],
			},
		],
		'import/no-extraneous-dependencies': ['error', createNoExtraneousDependenciesOptions()],
		'import/order': [
			'error',
			{
				groups: [
					//
					'builtin',
					'internal',
					'external',
					'parent',
					'sibling',
					'index',
				],
				pathGroups: [
					{
						pattern: '@nestjs/common',
						group: 'builtin',
						position: 'after',
					},
					{
						pattern: '@nestjs/core',
						group: 'builtin',
						position: 'after',
					},
					{
						pattern: '@nestjs/*',
						group: 'builtin',
						position: 'after',
					},
				],
				pathGroupsExcludedImportTypes: ['builtin'],
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
			},
		],
		'import/named': 'off',
	},
	overrides: [
		{
			files: ['.eslintrc.js'],
			parserOptions: {
				createDefaultProgram: true,
			},
		},
	],
};

function createTypescriptRules(obj) {
	const rules = {};
	// eslint-disable-next-line
	for (const key in obj) {
		rules[key] = 'off';
		rules[`@typescript-eslint/${key}`] = obj[key];
	}
	return rules;
}
