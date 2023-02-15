/// Auth storage internal symbol
const AUTH_STORAGE = Symbol('auth-storage');

/**
 * Get the authentication data from storage
 * @param authExecutionContext
 * @param authdata
 */
export function authStorageGet<TAuthData = unknown>(request: unknown): { data: TAuthData } | null {
	if (request == null) return null;
	return {
		data: (request as any)[AUTH_STORAGE] as TAuthData,
	};
}

/**
 * Set the authentication data for the authentication context
 * @param authExecutionContext
 * @param authdata
 */
export function authStorageSet(request: unknown, authdata: unknown) {
	Object.defineProperty(request, AUTH_STORAGE, {
		value: authdata,
		enumerable: false,
	});
}
