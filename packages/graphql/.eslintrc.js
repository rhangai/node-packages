module.exports = {
	root: true,
	plugins: ['@rhangai'],
	extends: ['plugin:@rhangai/typescript'],
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
	ignorePatterns: ['.eslintrc.js'],
};
