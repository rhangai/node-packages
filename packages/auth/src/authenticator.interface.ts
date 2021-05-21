import { AuthExecutionContext } from './auth-execution-context';

export const AUTHENTICATOR_KEY = Symbol('auth-authenticator-key');

export interface IAuthenticator<TAuthData = unknown> {
	authenticate(authExecutionContext: AuthExecutionContext): TAuthData | Promise<TAuthData>;
}
