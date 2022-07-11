import { ExecutionContext, CanActivate } from '@nestjs/common';
import {
	authExecutionContextGetStorageHost,
	authExecutionContextSetStorageData,
	AuthExecutionStorageHost,
} from './auth-execution-context';

export abstract class AuthGuardBase<TAuthData> implements CanActivate {
	/**
	 * Child classes must implement this function
	 * @param executionContext
	 * @returns The Authentication data extracted from the context
	 */
	abstract authenticate(
		executionContext: ExecutionContext
	): TAuthData | null | Promise<TAuthData | null>;

	/**
	 * Guard to check if you can activate the route
	 * @param executionContext
	 * @returns
	 */
	async canActivate(executionContext: ExecutionContext): Promise<boolean> {
		const storageHost = await this.getStorageHost(executionContext);
		if (storageHost) {
			const authdata = await this.authenticate(executionContext);
			authExecutionContextSetStorageData(storageHost, authdata);
		}
		return true;
	}

	/**
	 * Get the storage host
	 * @param executionContext
	 * @returns
	 */
	getStorageHost(
		executionContext: ExecutionContext
	): AuthExecutionStorageHost | null | Promise<AuthExecutionStorageHost | null> {
		return authExecutionContextGetStorageHost(executionContext);
	}
}
