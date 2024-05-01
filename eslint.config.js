import config from '@rhangai/eslint-config-typescript';

export default [
	{
		ignores: ['**/dist/**/*'],
	},
	...config.ts({
		meta: import.meta,
		devFiles: ['**/tsup.config.ts'],
	}),
];
