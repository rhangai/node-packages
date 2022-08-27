const importRules = require('eslint-config-airbnb-base/rules/imports').rules;

const extensionsJs = ['.js', '.cjs', '.mjs', '.ts', '.mts', '.cts'];
const extensions = [...extensionsJs, '.jsx', '.tsx'];

module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	extends: ['eslint-config-airbnb-base', 'plugin:prettier/recommended'],
	settings: {
		'import/extensions': extensions,
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts'],
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
		'import/no-extraneous-dependencies': [
			'error',
			{
				...importRules['import/no-extraneous-dependencies'][1],
				devDependencies: [
					...importRules['import/no-extraneous-dependencies'][1].devDependencies.flatMap(
						(devDep) => {
							// Ends with js
							if (devDep.endsWith('.js')) {
								const base = devDep.substr(0, devDep.length - 3);
								return `${base}.{js,cjs,mjs,ts,cts,mts}`;
							}

							// Ends with glob
							const match = /\{(.*?)\}$/.exec(devDep);
							if (match) {
								const set = new Set(match[1].split(','));
								if (set.has('jsx')) {
									extensions.forEach((ext) => set.add(ext.substring(1)));
								} else if (set.has('.jsx')) {
									extensions.forEach((ext) => set.add(ext));
								} else if (set.has('js')) {
									extensionsJs.forEach((ext) => set.add(ext.substring(1)));
								} else if (set.has('.js')) {
									extensionsJs.forEach((ext) => set.add(ext));
								}
								const base = devDep.substring(0, match.index);
								const exts = Array.from(set).join(',');
								return `${base}{${exts}}`;
							}
							return devDep;
						}
					),
					'**/*.stories.{cts,mts,ts,tsx,cjs,mjs,js,jsx,mdx}',
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
