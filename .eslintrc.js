module.exports = {
	root: true,
	extends: ['./packages/eslint-config-typescript/index.js'],
	parserOptions: {
		project: './tsconfig.json',
	},
	ignorePatterns: ['.eslintrc.js'],
	env: {
		jest: true,
	},
	rules: {
		'no-await-in-loop': 'off',
	},
};
