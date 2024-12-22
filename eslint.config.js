import globals from 'globals';
import config from '@rhangai/eslint-config-typescript';

export default [
	...config.ts({
		ignores: ['**/dist/**/*'],
		meta: import.meta,
		devFiles: ['**/tsup.config.ts', 'eslint.config.js', '**/*.spec.ts'],
		globals: {
			...globals.node,
		},
		internalPackagesRegex: '^@rhangai',
	}),
];
