import { Cache } from './cache';
import type { CacheOptions } from './cache-options';

/**
 * Cache decorator
 *
 * Applys the cache using the given decorator
 */
export function CacheDecorator<TCacheKey>(
	keyFn: (...params: any[]) => TCacheKey,
	cacheOptions?: CacheOptions | number
): MethodDecorator {
	return (target, propertyKey, descriptor: any) => {
		if (descriptor.value != null) {
			const originalFn = descriptor.value;
			if (typeof originalFn !== 'function') {
				throw new Error(`Must only decorate functions`);
			}
			const cache = new Cache<TCacheKey, any>(cacheOptions);
			// eslint-disable-next-line func-names
			const newValue = function (this: any, ...params: any[]) {
				const cacheKey = keyFn(...params);
				return cache.get(cacheKey, () => originalFn.apply(this, params));
			};
			// eslint-disable-next-line no-param-reassign
			descriptor.value = newValue;
		} else {
			throw new Error(`CacheDecorator can only be used on functions`);
		}
	};
}
