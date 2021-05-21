import { ExecutionContext } from '@nestjs/common';

export type AuthExecutionContextHttp = {
	type: 'http';
	executionContext: ExecutionContext;
	request: any;
};
export type AuthExecutionContextGraphql = {
	type: 'graphql';
	executionContext: ExecutionContext;
	graphqlContext: any;
};
export type AuthExecutionContext = AuthExecutionContextHttp | AuthExecutionContextGraphql;

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
	if (type === 'http') {
		const httpContext = executionContext.switchToHttp();
		return {
			type: 'http',
			executionContext,
			request: httpContext.getRequest(),
		};
	} else if ((type as string) === 'graphql') {
		const graphqlContext: any = executionContext.getArgByIndex(2);
		return {
			type: 'graphql',
			executionContext,
			graphqlContext,
		};
	}
	return null;
}

/**
 * Get the authentication data
 * @param authExecutionContext
 * @param authdata
 */
export function authExecutionContextGetData(authExecutionContext: AuthExecutionContext) {
	if (authExecutionContext.type === 'http') {
		return authExecutionContext.request[AUTH_EXECUTION_CONTEXT_DATA_KEY];
	}
	return authExecutionContext.graphqlContext[AUTH_EXECUTION_CONTEXT_DATA_KEY];
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
	if (authExecutionContext.type === 'http') {
		Object.defineProperty(authExecutionContext.request, AUTH_EXECUTION_CONTEXT_DATA_KEY, {
			value: authdata,
		});
	} else {
		Object.defineProperty(authExecutionContext.graphqlContext, AUTH_EXECUTION_CONTEXT_DATA_KEY, {
			value: authdata,
		});
	}
}
