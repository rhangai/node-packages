import Heap from 'heap';
import type { MarkOptional } from 'ts-essentials';
import { CacheOptions, cacheOptionsNormalize, CacheOptionsNormalized } from './cache-options';

type CacheEntry<TKey, TValue> = {
	key: TKey;
	/**
	 * The promise result
	 */
	valuePromise: Promise<TValue>;
	/**
	 * The value when the function is being called cold
	 */
	valueUpdatePending: Promise<void> | null;
	/**
	 * If the entry is still valid
	 */
	invalid: boolean;
	/**
	 * When this entry was created
	 */
	createdAt: number;
};

/**
 * Async cache with better timing functions
 */
export class Cache<TKey = string | number, TValue = unknown> {
	/**
	 * The entry map
	 */
	private readonly cacheEntryMap = new Map<TKey, CacheEntry<TKey, TValue>>();

	/**
	 * The entry heap. Used to keep a sorted list of cache entries based on creation time.
	 */
	private readonly cacheEntryHeap = new Heap<CacheEntry<TKey, TValue>>((a, b) => {
		if (a.invalid) {
			if (b.invalid) return 0;
			return -1;
		} else if (b.invalid) {
			return 1;
		}
		return a.createdAt - b.createdAt;
	});

	/**
	 * Cache options
	 */
	private readonly options: CacheOptionsNormalized;

	/**
	 * Construct the cache
	 */
	constructor(options: CacheOptions = {}) {
		this.options = cacheOptionsNormalize(options);
	}

	/**
	 * Get a cached value, if possible.
	 * Otherwise, it saves the entry in the cache.
	 *
	 * If the entry is cold while being fetched, it will become hot again
	 */
	get(key: TKey, lazyFn: () => TValue | Promise<TValue>): Promise<TValue> {
		const oldEntry = this.cacheEntryMap.get(key);

		const now = Date.now();

		let entry = oldEntry;
		if (!entry || !this.isEntryValid(entry, now)) {
			entry = this.refreshEntry(oldEntry, key, lazyFn, now);
		} else if (this.isEntryCold(entry, now)) {
			this.refreshEntryCold(entry, lazyFn);
		}
		return entry.valuePromise;
	}

	/**
	 * Deletes an item from the cache
	 */
	delete(key: TKey): void {
		const entry = this.cacheEntryMap.get(key);
		if (entry) {
			entry.invalid = true;
			this.cacheEntryMap.delete(key);
			this.cacheEntryHeap.updateItem(entry);
			this.refreshEntryHeap(Date.now());
		}
	}

	/**
	 * Refreshes the cache. Cleaning every expired item.
	 */
	refresh(): void {
		this.refreshEntryHeap(Date.now());
	}

	/**
	 * Clears the cache
	 */
	clear(): void {
		this.cacheEntryHeap.clear();
		this.cacheEntryMap.clear();
	}

	/**
	 * Size of the cache
	 */
	size(): number {
		return this.cacheEntryHeap.size();
	}

	/**
	 * Check if the cache has the entry (But does not refresh it)
	 */
	hasEntry(key: TKey): boolean {
		return this.cacheEntryMap.has(key);
	}

	/**
	 * Check if the entry is still valid
	 */
	private isEntryValid(entry: CacheEntry<TKey, TValue>, now: number): boolean {
		if (entry.invalid) return false;
		const expiration = entry.createdAt + this.options.duration;
		if (now >= expiration) return false;
		return true;
	}

	/**
	 * Check if entry is already cold
	 */
	private isEntryCold(entry: CacheEntry<TKey, TValue>, now: number): boolean {
		const coldTime = entry.createdAt + this.options.durationUntilCold;
		if (now >= coldTime) return true;
		return false;
	}

	/**
	 * Faz o refresh de uma entrada no cache
	 */
	private refreshEntry(
		oldEntry: CacheEntry<TKey, TValue> | undefined,
		key: TKey,
		lazyFn: () => TValue | Promise<TValue>,
		now: number
	): CacheEntry<TKey, TValue> {
		const entry: MarkOptional<CacheEntry<TKey, TValue>, 'valuePromise'> = {
			key,
			invalid: false,
			valueUpdatePending: null,
			createdAt: Date.now(),
		};
		entry.valuePromise = Promise.resolve(lazyFn()).catch((err) => {
			entry.invalid = true;
			throw err;
		});

		let result: CacheEntry<TKey, TValue>;
		if (oldEntry) {
			Object.assign(oldEntry, entry);
			result = oldEntry;
			this.cacheEntryHeap.updateItem(oldEntry);
		} else {
			result = entry as CacheEntry<TKey, TValue>;
			this.cacheEntryMap.set(key, result);
			this.cacheEntryHeap.push(result);
		}
		this.refreshEntryHeap(now);
		return result;
	}

	/**
	 * Faz o refresh de uma entrada no cache
	 */
	private refreshEntryCold(
		entryParam: CacheEntry<TKey, TValue>,
		lazyFn: () => TValue | Promise<TValue>
	) {
		const entry = entryParam;
		if (!entry.valueUpdatePending) {
			entry.valueUpdatePending = Promise.resolve(lazyFn()).then(
				(newValue) => {
					entry.invalid = false;
					entry.createdAt = Date.now();
					entry.valuePromise = Promise.resolve(newValue);
					entry.valueUpdatePending = null;
					this.cacheEntryHeap.updateItem(entry);
					this.refresh();
				},
				(err) => {
					entry.valueUpdatePending = null;
					throw err;
				}
			);
		}
	}

	/**
	 * Faz o refresh de uma entrada no cache
	 */
	private refreshEntryHeap(now: number) {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
		while (true) {
			const top = this.cacheEntryHeap.peek();
			if (!top || this.isEntryValid(top, now)) {
				break;
			}

			this.cacheEntryHeap.pop();
			this.cacheEntryMap.delete(top.key);
		}
	}
}
