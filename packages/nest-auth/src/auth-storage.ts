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
	storage: any,
	keyParam: unknown
): { data: TAuthData } | null {
	const store = getStore(storage);
	if (!store) return null;
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
export function authStorageSet(storage: any, keyParam: unknown, data: unknown) {
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
function getStore(storage: any): StoreMap | undefined | null {
	if (storage == null) return null;
	return storage[AUTH_STORAGE];
}
