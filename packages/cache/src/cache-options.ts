export type CacheOptions = {
	/**
	 * Duration for cache
	 */
	duration?: number;
	/**
	 * Duration for cache until it becomes cold. Must be less than duration otherwise
	 * it wont do anything. Defaults to (2/3) of the duration
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
export function cacheOptionsNormalize(
	optionsParam: CacheOptions | number | undefined
): CacheOptionsNormalized {
	let options: CacheOptions;
	if (typeof optionsParam === 'number') {
		options = { duration: optionsParam };
	} else {
		options = optionsParam ?? {};
	}
	const duration = options.duration ?? DEFAULT_DURATION;
	return {
		duration,
		durationUntilCold: options.durationUntilCold ?? Math.round((duration * 2) / 3),
	};
}
