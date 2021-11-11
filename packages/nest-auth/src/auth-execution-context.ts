import { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

type GraphqlArgumentsHost = {
	getRoot<T = any>(): T;
	getArgs<T = any>(): T;
	getContext<T = any>(): T;
	getInfo<T = any>(): T;
};

export type AuthExecutionContextHttp = {
	type: 'http';
	storage: any;
	executionContext: ExecutionContext;
	http: HttpArgumentsHost;
};
export type AuthExecutionContextGraphql = {
	type: 'graphql';
	storage: any;
	executionContext: ExecutionContext;
	graphql: GraphqlArgumentsHost;
};
export type AuthExecutionContext = AuthExecutionContextHttp | AuthExecutionContextGraphql;
export type AuthExecutionStorageHost = { storage: any };

const AUTH_EXECUTION_CONTEXT_DATA_KEY = Symbol('auth-execution-context-data');

/**
 * Get the authentication context
 * @param executionContext
 * @returns
 */
export function authExecutionContextGet(
	executionContext: ExecutionContext
): AuthExecutionContext | null {
	const type = executionContext.getType();
	const storageHost = authExecutionContextGetStorage(executionContext);
	if (!storageHost) return null;
	const { storage } = storageHost;
	if (type === 'http') {
		const httpArgs = executionContext.switchToHttp();
		return {
			type: 'http',
			storage,
			executionContext,
			http: httpArgs,
		};
	} else if ((type as string) === 'graphql') {
		return {
			type: 'graphql',
			storage,
			executionContext,
			graphql: {
				getRoot<T = any>(): T {
					return executionContext.getArgByIndex(0);
				},
				getArgs<T = any>(): T {
					return executionContext.getArgByIndex(1);
				},
				getContext<T = any>(): T {
					return executionContext.getArgByIndex(2);
				},
				getInfo<T = any>(): T {
					return executionContext.getArgByIndex(3);
				},
			},
		};
	}
	return null;
}
/**
 * Get the authentication context
 * @param executionContext
 * @returns
 */
export function authExecutionContextGetStorage(
	argumentsHost: ArgumentsHost
): AuthExecutionStorageHost | null {
	const type = argumentsHost.getType();
	if (type === 'http') {
		const httpArgs = argumentsHost.switchToHttp();
		return {
			storage: httpArgs.getRequest(),
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
export function authExecutionContextGetDataFromStorage({ storage }: AuthExecutionStorageHost) {
	return storage[AUTH_EXECUTION_CONTEXT_DATA_KEY];
}

/**
 * Set the authentication data for the authentication context
 * @param authExecutionContext
 * @param authdata
 */
export function authExecutionContextSetData(
	authExecutionContext: AuthExecutionContext,
	authdata: unknown
) {
	Object.defineProperty(authExecutionContext.storage, AUTH_EXECUTION_CONTEXT_DATA_KEY, {
		value: authdata,
	});
}
