module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	extends: ['eslint-config-airbnb-base'],
	settings: {
		'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
		'import/resolver': {
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
		indent: ['error', 'tab'],
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
		quotes: ['warn', 'single', { allowTemplateLiterals: true }],
		'@typescript-eslint/no-floating-promises': 'error',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		...createTypescriptRules({
			'comma-dangle': [
				'error',
				{
					arrays: 'always-multiline',
					objects: 'always-multiline',
					imports: 'always-multiline',
					exports: 'always-multiline',
					functions: 'never',
				},
			],
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
					{
						pattern: '{@@**,@@*/**}',
						group: 'internal',
						position: 'before',
					},
					{
						pattern: '{~/**,~/*/**}',
						group: 'internal',
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
