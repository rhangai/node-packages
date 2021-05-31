# @rhangai/nest-core

## Usage

Somewhere in your main file

```ts
import '@rhangai/nest-core/setup';
```

Create a `config.ts` file

```ts
import { configRegister, ConfigType } from '@rhangai/nest-core';

export type Config = ConfigType<typeof configFactory>;
export const configFactory = configRegister(({ env }) => ({
	env: env('APP_ENV', 'development'),
	db: {
		host: env('APP_DB_HOST', 'db'),
	},
}));
```

Create the `ormconfig.ts` for typeorm

```ts
import { resolve } from 'path';
import { configResolve } from '@rhangai/nest-core';
import { ConnectionOptions } from 'typeorm';

export = configResolve<ConnectionOptions>(({ env, envInt }) => ({
	type: 'postgres',
	host: env('APP_DB_HOST', 'db'),
	port: envInt('APP_DB_PORT', 5234),
	username: env('APP_DB_USERNAME', 'dev'),
	password: env('APP_DB_PASSWORD', 'dev'),
	database: env('APP_DB_DATABASE', 'database'),
	entities: [resolve(__dirname, '../**/*.entity.{ts,js}')],
	migrations: [resolve(__dirname, './migrations')],
}));
```

Create the root module

```ts
import { createCoreModule } from '@rhangai/nest-core';
import { configFactory } from './config';
import ormconfig from './ormconfig';

export const CoreModule = createCoreModule({
	configFactory,
	ormconfig,
});
```

## Controllers

Create your controllers

```ts
import { createCoreModule } from '@rhangai/nest-core';
import { configFactory } from './config';
import ormconfig from './ormconfig';

export const CoreModule = createCoreModule({
	configFactory,
	ormconfig,
});
```
