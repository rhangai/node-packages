module.exports = {
	root: true,
	extends: ['@rhangai/typescript'],
	parserOptions: {
		project: './tsconfig.json',
	},
	ignorePatterns: ['.eslintrc.js'],
	env: {
		jest: true,
	},
	rules: {
		'no-await-in-loop': 'off',
	}
};
