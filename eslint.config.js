import config from '@rhangai/eslint-config-typescript';
import globals from 'globals';

export default [
	{
		ignores: ['**/dist/**/*'],
	},
	{
		languageOptions: {
			globals: {
				...globals.node,
			},
		},
	},
	...config.ts({
		meta: import.meta,
		devFiles: ['**/tsup.config.ts'],
	}),
	{
		rules: {
			'sort-imports': [
				'warn',
				{
					ignoreCase: true,
					ignoreDeclarationSort: true,
				},
			],
		},
	},
];
