# @rhangai/eslint-config-typescript

## Installation

```sh
yarn add --dev eslint @rhangai/eslint-config-typescript
```

```js
import config from '@rhangai/eslint-config-typescript';

export default [
	...config.ts(),
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
```
