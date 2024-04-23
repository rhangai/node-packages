module.exports = {
	root: true,
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
