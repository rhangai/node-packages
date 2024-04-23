type CacheOptions = {
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

type CacheFn<TKey, TValue> = (key: TKey) => TValue | Promise<TValue>;
/**
 * Async cache with better timing functions
 */
declare class Cache<TKey = string | number, TValue = unknown> {
    /**
     * The entry map
     */
    private readonly cacheEntryMap;
    /**
     * The entry heap. Used to keep a sorted list of cache entries based on creation time.
     */
    private readonly cacheEntryHeap;
    /**
     * Cache options
     */
    private readonly options;
    /**
     * Construct the cache
     */
    constructor(options?: CacheOptions | number | undefined);
    /**
     * Get a cached value, if possible.
     * Otherwise, it saves the entry in the cache.
     *
     * If the entry is cold while being fetched, it will become hot again
     */
    get(key: TKey, lazyFn: CacheFn<TKey, TValue>): Promise<TValue>;
    /**
     * Deletes an item from the cache
     */
    delete(key: TKey): void;
    /**
     * Refreshes the cache. Cleaning every expired item.
     */
    refresh(): void;
    /**
     * Clears the cache
     */
    clear(): void;
    /**
     * Size of the cache
     */
    size(): number;
    /**
     * Check if the cache has the entry (But does not refresh it)
     */
    hasEntry(key: TKey): boolean;
    /**
     * Check if the entry is still valid
     */
    private isEntryValid;
    /**
     * Check if the entry is still valid
     */
    private isTimeExpired;
    /**
     * Check if entry is already cold
     */
    private isEntryCold;
    /**
     * Faz o refresh de uma entrada no cache
     */
    private refreshEntry;
    /**
     * Faz o refresh de uma entrada no cache
     */
    private refreshEntryCold;
    /**
     * Faz o refresh de uma entrada no cache
     */
    private refreshEntryHeap;
}

/**
 * Cache decorator
 *
 * Applys the cache using the given decorator
 */
declare function CacheDecorator<TCacheKey>(keyFn: (...params: any[]) => TCacheKey, cacheOptions?: CacheOptions | number): MethodDecorator;

export { Cache, CacheDecorator, type CacheOptions };
