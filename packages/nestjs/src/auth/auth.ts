import {
	type ArgumentsHost,
	createParamDecorator,
	type ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import { authStorageGet, authStorageSet } from './auth-storage';

/// The decorar type
type DecoratorFn<TData> = (data: TData) => ParameterDecorator;

type AuthenticateResult<TAuthData> = [null] | [true, TAuthData | null];
/**
 * Definition for the auth object
 */
export type AuthDefinition<TAuthData> = {
	/**
	 * Get the request
	 * @param getter
	 */
	getData(argumentsHost: ArgumentsHost): { data: TAuthData } | null;
	/**
	 * Create a decorator
	 * @param getter
	 */
	createDecorator<TData = void>(
		getter: (data: TData, authdata: TAuthData) => unknown,
	): DecoratorFn<TData>;
	/**
	 * Method to authenticate the ExecutionContext
	 *
	 * @returns null if authentication does not apply, a boolean otherwise
	 */
	authenticate(
		executionContext: ExecutionContext,
		data: () => TAuthData | null | Promise<TAuthData | null>,
	): Promise<AuthenticateResult<TAuthData>>;
};

type AuthStorageResult = {
	request: unknown;
	key?: unknown;
};

/**
 * Options to create the auth definition
 */
export type CreateAuthDefinitionOptions = {
	/**
	 * Get the request form the arguments host on a graphql context
	 */
	graphql?: ((argumentsHost: ArgumentsHost) => [request: unknown, context: unknown]) | null;
	/**
	 * Get the storage from the arguments host, defaults to the
	 */
	getStorage?: ((argumentsHost: ArgumentsHost) => AuthStorageResult | null) | null;
};

/**
 * Create the auth definition
 *
 * The AuthDefinition is reponsible for AuthOperations on the auth context
 */
export function createAuthDefinition<TAuthData>(
	options: CreateAuthDefinitionOptions = {},
): AuthDefinition<TAuthData> {
	const { graphql } = options;
	const getStorageDefault = (argumentsHost: ArgumentsHost): AuthStorageResult | null => {
		const type = argumentsHost.getType();
		if (type === 'http') {
			const request: unknown = argumentsHost.getArgByIndex(0);
			return {
				request,
			};
		} else if ((type as string) === 'graphql') {
			if (!graphql) {
				return null;
			}
			const [request, context] = graphql(argumentsHost);
			if (!request || !context) {
				return null;
			}
			return {
				request,
				key: context,
			};
		}
		return null;
	};

	// The storage is the request
	const getStorage = options.getStorage ?? getStorageDefault;

	// Get the auth data
	function getData(argumentsHost: ArgumentsHost): { data: TAuthData } | null {
		const storage = getStorage(argumentsHost);
		if (!storage) {
			throw new Error(`Invalid storage`);
		}
		const authData = authStorageGet<TAuthData>(storage.request, storage.key);
		return authData;
	}

	return {
		/*
		  Get the data from the ArgumentsHost
		 */
		getData,
		/*
		  Create the decorator
		 */
		createDecorator<TData>(getter: (data: TData, authdata: TAuthData) => unknown) {
			return createParamDecorator<TData, ArgumentsHost>((data, ctx) => {
				const authData = getData(ctx);
				if (!authData) {
					throw new UnauthorizedException();
				}
				return getter(data, authData.data);
			});
		},
		/*
		  Apply the authentication data if the storage is valid
		  Otherwise, returns null
		 */
		async authenticate(
			ctx: ExecutionContext,
			dataFn: () => TAuthData | null | Promise<TAuthData | null>,
		): Promise<AuthenticateResult<TAuthData>> {
			const storage = getStorage(ctx);
			if (!storage) {
				return [null];
			}
			const authData = await dataFn();
			authStorageSet(storage.request, storage.key, authData);
			return [true, authData];
		},
	};
}
