const importRules = require('eslint-config-airbnb-base/rules/imports').rules;

module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	extends: ['eslint-config-airbnb-base', 'plugin:prettier/recommended'],
	settings: {
		'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {},
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
			},
		},
	},
	rules: {
		curly: 'off',
		'class-methods-use-this': 'off',
		'function-paren-newline': 'off',
		'implicit-arrow-linebreak': 'off',
		'max-classes-per-file': 'off',
		'no-continue': 'off',
		'no-else-return': ['error', { allowElseIf: true }],
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		'no-restricted-syntax': ['error', 'WithStatement', 'LabeledStatement'],
		'no-tabs': 'off',
		'no-void': ['error', { allowAsStatement: true }],
		'nonblock-statement-body-position': 'off',
		'object-curly-newline': 'off',
		'prefer-destructuring': ['error', { VariableDeclarator: { object: true } }],
		'@typescript-eslint/no-floating-promises': 'error',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
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
				},
			},
		],
		'import/no-unresolved': [
			'error',
			{
				ignore: ['^@@', '^~'],
			},
		],
		'import/no-extraneous-dependencies': [
			'error',
			{
				...importRules['import/no-extraneous-dependencies'][1],
				devDependencies: [
					...importRules['import/no-extraneous-dependencies'][1].devDependencies.flatMap(
						(devDep) => {
							const devDepWithTs = devDep.replace(/\bjs(x?)\b/g, 'ts$1');
							if (devDepWithTs === devDep) {
								return devDep;
							}
							return [devDep, devDepWithTs];
						}
					),
					'**/*.stories.{ts,tsx,js,jsx,mdx}',
				],
			},
		],
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
	},
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
