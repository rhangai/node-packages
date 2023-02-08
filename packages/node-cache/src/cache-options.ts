export type CacheOptions = {
	/**
	 * Duration for cache
	 */
	duration?: number;
	/**
	 * Duration for cache until it becomes cold. Must be less than duration otherwise
	 * it wont do anything
	 */
	durationUntilCold?: number;
};

export type CacheOptionsNormalized = {
	duration: number;
	durationUntilCold: number;
};

// Default duration when using cache (30s)
const DEFAULT_DURATION = 30000;

/**
 * Normalize the cache options
 */
export function cacheOptionsNormalize(options: CacheOptions): CacheOptionsNormalized {
	return {
		duration: options.duration ?? DEFAULT_DURATION,
		durationUntilCold: options.durationUntilCold ?? Infinity,
	};
}
