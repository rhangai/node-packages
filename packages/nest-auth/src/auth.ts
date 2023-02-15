import type { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { createParamDecorator, UnauthorizedException } from '@nestjs/common';
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
		getter: (data: TData, authdata: TAuthData) => unknown
	): DecoratorFn<TData>;
	/**
	 * Method to authenticate the ExecutionContext
	 *
	 * @returns null if authentication does not apply, a boolean otherwise
	 */
	authenticate(
		executionContext: ExecutionContext,
		data: () => TAuthData | null | Promise<TAuthData | null>
	): Promise<AuthenticateResult<TAuthData>>;
};

/**
 * Options to create the auth definition
 */
export type CreateAuthOptions = {
	/**
	 * Get the request form the arguments host on a graphql context
	 */
	getRequestGraphql?: ((argumentsHost: ArgumentsHost) => unknown) | null;
	/**
	 * Get the storage from the arguments host, defaults to the
	 */
	getStorage?: ((argumentsHost: ArgumentsHost) => unknown) | null;
};

/**
 * Create the auth definition
 *
 * The AuthDefinition is reponsible for AuthOperations on the auth context
 */
export function createAuth<TAuthData>(options: CreateAuthOptions): AuthDefinition<TAuthData> {
	const { getRequestGraphql } = options;
	const getRequest = (argumentsHost: ArgumentsHost) => {
		const type = argumentsHost.getType();
		if (type === 'http') {
			return argumentsHost.getArgByIndex(0);
		} else if ((type as string) === 'graphql') {
			return getRequestGraphql?.(argumentsHost) ?? null;
		}
		return null;
	};

	// The storage is the request
	const getStorage = options.getStorage ?? getRequest;

	// Get the auth data
	function getData(argumentsHost: ArgumentsHost): { data: TAuthData } | null {
		const storage = getStorage(argumentsHost);
		if (!storage) throw new Error(`Invalid storage`);
		const authData = authStorageGet<TAuthData>(storage);
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
			return createParamDecorator<TData>((data, ctx) => {
				const authData = getData(ctx);
				if (!authData) throw new UnauthorizedException();
				return getter(data, authData.data);
			});
		},
		/*
		  Apply the authentication data if the storage is valid
		  Otherwise, returns null
		 */
		async authenticate(
			ctx: ExecutionContext,
			dataFn: () => TAuthData | null | Promise<TAuthData | null>
		): Promise<AuthenticateResult<TAuthData>> {
			const storage = getStorage(ctx);
			if (!storage) return [null];
			const authData = await dataFn();
			authStorageSet(storage, authData);
			return [true, authData];
		},
	};
}
