import { ArgumentsHost } from '@nestjs/common';

export type AuthExecutionStorageHost = { storage: any };

const AUTH_EXECUTION_CONTEXT_DATA_KEY = Symbol('auth-execution-context-data');

/**
 * Get the authentication context
 * @param executionContext
 * @returns
 */
export function authExecutionContextGetStorageHost(
	argumentsHost: ArgumentsHost
): AuthExecutionStorageHost | null {
	const type = argumentsHost.getType();
	if (type === 'http') {
		return {
			storage: argumentsHost.getArgByIndex(0),
		};
	} else if ((type as string) === 'graphql') {
		return {
			storage: argumentsHost.getArgByIndex(3),
		};
	}
	return null;
}

/**
 * Get the authentication data from storage
 * @param authExecutionContext
 * @param authdata
 */
export function authExecutionContextGetData<TAuthData = unknown>(
	host: ArgumentsHost
): { data: TAuthData } | null {
	const storageHost = authExecutionContextGetStorageHost(host);
	if (!storageHost) return null;
	return { data: storageHost.storage[AUTH_EXECUTION_CONTEXT_DATA_KEY] };
}

/**
 * Set the authentication data for the authentication context
 * @param authExecutionContext
 * @param authdata
 */
export function authExecutionContextSetStorageData(
	storageHost: AuthExecutionStorageHost,
	authdata: unknown
) {
	Object.defineProperty(storageHost.storage, AUTH_EXECUTION_CONTEXT_DATA_KEY, {
		value: authdata,
	});
}
