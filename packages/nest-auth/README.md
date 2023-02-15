# @rhangai/nest-auth

Simpler implementation of a guard without using passport

## Installation

```sh
yarn add @rhangai/nest-auth
```

## Quick Usage

Define your authentication data

```ts
import { createAuthDefinition } from '@rhangai/nest-auth';

export type AuthData = {
	user: MyUserType;
};

const AuthDefinition = createAuthDefinition<AuthData>();
```

Create the guard

```ts
import { Injectable } from '@nestjs/common';
import { AuthData, AuthDefinition } from './auth-data';

@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(ctx): Promise<boolean> {
		const [isValid] = await AuthDefinition.authenticate(ctx, () => this.getAuthData(ctx));
		if (isValid == null) return true;
		return isValid;
	}

	private async getAuthData(
		authExecutionContext: AuthExecutionContext
	): Promise<AuthData | null> {
		// Do your logic
		return {
			user: {}, // From somewhere
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
import { AuthDefinition } from './auth-data';

export const AuthUser = AuthDefinition.createDecorator((_, authData) => authData.user);
```

Use in the controller

```ts
import { Controller, Get } from '@nestjs/common';
import { AuthUser } from './auth-decorators';

@Controller()
export class SomeController {
	@Get()
	handler(@AuthUser() user: MyUserType) {
		return user;
	}
}
```
