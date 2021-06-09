import { DynamicModule, Module, ModuleMetadata, Provider, Type } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthExecutionContextService } from './auth-execution-context.service';
import { IAuthenticator, AUTHENTICATOR_KEY } from './authenticator.interface';
import { AuthInterceptor } from './auth.interceptor';

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
	provideGlobalInterceptor?: boolean;
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
	if (options.provideGlobalInterceptor !== false) {
		providers.push({
			provide: APP_INTERCEPTOR,
			useClass: AuthInterceptor,
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
