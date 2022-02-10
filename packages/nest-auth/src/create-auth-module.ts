import { DynamicModule, Module, ModuleMetadata, Provider, Type } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthExecutionContextService } from './auth-execution-context.service';
import { AuthGuard } from './auth.guard';
import { IAuthenticator, AUTHENTICATOR_KEY } from './authenticator.interface';

/**
 * Basic auth module
 */
@Module({
	providers: [AuthExecutionContextService],
	exports: [AuthExecutionContextService],
})
class AuthModule {}

/**
 * Authentication options
 */
export type CreateAuthModuleOptions = ModuleMetadata & {
	/**
	 * Provide a global interceptor
	 */
	provideGlobalGuard?: boolean;
	/**
	 * The authenticator type to use
	 */
	authenticator: Type<IAuthenticator<any>>;
};

/**
 * Create a new AuthModule to use
 */
export function createAuthModule(options: CreateAuthModuleOptions): DynamicModule {
	const providers: Provider[] = options.providers ? [...options.providers] : [];
	providers.push({
		provide: AUTHENTICATOR_KEY,
		useClass: options.authenticator,
	});
	if (options.provideGlobalGuard !== false) {
		providers.push({
			provide: APP_GUARD,
			useClass: AuthGuard,
		});
	}
	return {
		module: AuthModule,
		controllers: options.controllers,
		imports: options.imports,
		exports: options.exports,
		providers,
	};
}
