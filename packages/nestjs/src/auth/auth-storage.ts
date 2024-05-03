/// Auth storage internal symbol
const AUTH_STORAGE = Symbol('auth-storage');
const AUTH_STORAGE_DEFAULT_KEY = Symbol('auth-storage-default-key');

// Store map
type StoreMap = Map<unknown, unknown>;

/**
 * Get the authentication data from storage
 * @param authExecutionContext
 * @param authdata
 */
export function authStorageGet<TAuthData = unknown>(
	storage: unknown,
	keyParam: unknown,
): { data: TAuthData } | null {
	const store = getStore(storage);
	if (!store) {
		return null;
	}
	const key = keyParam || AUTH_STORAGE_DEFAULT_KEY;
	return {
		data: store.get(key) as TAuthData,
	};
}

/**
 * Set the authentication data for the authentication context
 * @param authExecutionContext
 * @param authdata
 */
export function authStorageSet(storage: unknown, keyParam: unknown, data: unknown) {
	let store = getStore(storage);
	if (!store) {
		store = new Map();
		Object.defineProperty(storage, AUTH_STORAGE, {
			value: store,
			enumerable: false,
		});
	}
	const key = keyParam || AUTH_STORAGE_DEFAULT_KEY;
	store.set(key, data);
}

// Pega o store
function getStore(storage: unknown): StoreMap | undefined | null {
	if (storage == null) {
		return null;
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
	return (storage as any)[AUTH_STORAGE];
}
