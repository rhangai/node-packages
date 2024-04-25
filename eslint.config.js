import config from '@rhangai/eslint-config-typescript';

export default [
	...config.ts,
	{
		ignores: ['**/dist/**/*'],
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
];
