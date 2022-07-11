# @rhangai/nest-auth

Simpler implementation of a guard without using passport

## Installation

```sh
yarn add @rhangai/nest-auth
```

## Guard

Define your authentication data

```ts
export type AuthData = {
	user: { id: number; name: string };
};
```

Create the guard

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuardBase } from '@rhangai/nest-auth';
import { AuthData } from './auth-data';

@Injectable()
export class AuthGuard extends AuthGuardBase<AuthData> {
	async authenticate(authExecutionContext: AuthExecutionContext): Promise<AuthData | null> {
		// Do your logic
		return {
			user: {
				id: 1,
				name: 'John Doe',
			},
		};
	}
}
```

Use the module globally or locally

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
	providers: [
		// Global guard
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
	],
})
export class AuthModule {}
```

## Decorators

Create the decorators

```ts
import { AuthData } from './auth-data';
import { createAuthParamDecorador } from '@rhangai/nest-auth';

export const AuthUser = createAuthParamDecorador<AuthData>((_, authData) => authData.user);
```

Use in the controller

```ts
import { Controller, Get } from '@nestjs/common';
import { AuthUser } from './auth-decorators';

@Controller()
export class SomeController {
	@Get()
	handler(@AuthUser() user: unknown) {
		return user;
	}
}
```
