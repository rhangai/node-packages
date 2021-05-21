import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthService } from './auth.service';
import { IAuthenticator, AUTHENTICATOR_KEY } from './authenticator.interface';
import { AuthInterceptor } from './auth.interceptor';

/**
 * Authentication options
 */
export type AuthModuleOptions<TAuthenticator extends IAuthenticator<any>> = {
	/**
	 * Provide a global interceptor
	 */
	provideGlobalInterceptor?: boolean;
	/**
	 * The authenticator type to use
	 */
	authenticator: Type<TAuthenticator>;
	/**
	 * The authenticator type to use
	 */
	imports?: DynamicModule['imports'];
};

@Module({
	providers: [AuthService],
	exports: [AuthService],
})
export class AuthModule {
	static forRoot<T extends IAuthenticator<any>>(options: AuthModuleOptions<T>): DynamicModule {
		const providers: Provider[] = [
			{
				provide: AUTHENTICATOR_KEY,
				useClass: options.authenticator,
			},
		];
		if (options.provideGlobalInterceptor !== false) {
			providers.push({
				provide: APP_INTERCEPTOR,
				useClass: AuthInterceptor,
			});
		}
		return {
			module: AuthModule,
			imports: options.imports,
			providers,
		};
	}
}
