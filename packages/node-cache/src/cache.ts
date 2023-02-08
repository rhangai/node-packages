import Heap from 'heap';
import type { MarkOptional } from 'ts-essentials';
import { CacheOptions, cacheOptionsNormalize, CacheOptionsNormalized } from './cache-options';

type CacheEntryPending<TValue> = {
	value: Promise<TValue>;
	createdAt: number;
};

type CacheEntry<TKey, TValue> = {
	key: TKey;
	/**
	 * The promise result
	 */
	valuePromise: Promise<TValue>;
	/**
	 * If the entry is still valid
	 */
	invalid: boolean;
	/**
	 * When this entry was created
	 */
	createdAt: number;
	/**
	 * Value for pending action
	 */
	pending: CacheEntryPending<TValue> | null;
};

/// Type for the function
type CacheFn<TKey, TValue> = (key: TKey) => TValue | Promise<TValue>;

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
	constructor(options?: CacheOptions | number | undefined) {
		this.options = cacheOptionsNormalize(options);
	}

	/**
	 * Get a cached value, if possible.
	 * Otherwise, it saves the entry in the cache.
	 *
	 * If the entry is cold while being fetched, it will become hot again
	 */
	get(key: TKey, lazyFn: CacheFn<TKey, TValue>): Promise<TValue> {
		const oldEntry = this.cacheEntryMap.get(key);

		const now = Date.now();

		let entry = oldEntry;
		if (!entry || !this.isEntryValid(entry, now)) {
			entry = this.refreshEntry(oldEntry, key, lazyFn, now);
		} else if (this.isEntryCold(entry, now)) {
			this.refreshEntryCold(entry, lazyFn, now);
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
		if (this.isTimeExpired(entry.createdAt, now)) return false;
		return true;
	}

	/**
	 * Check if the entry is still valid
	 */
	private isTimeExpired(time: number, now: number): boolean {
		const expiration = time + this.options.duration;
		return now >= expiration;
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
		lazyFn: CacheFn<TKey, TValue>,
		now: number
	): CacheEntry<TKey, TValue> {
		if (oldEntry) {
			const entry = oldEntry;
			// If there is a valid pending entry
			if (oldEntry.pending && !this.isTimeExpired(oldEntry.pending.createdAt, now)) {
				entry.createdAt = oldEntry.pending.createdAt;
				entry.valuePromise = oldEntry.pending.value.catch((err) => {
					entry.invalid = true;
					throw err;
				});
				entry.pending = null;

				// Check if the pending entry is already cold
				if (this.isEntryCold(entry, now)) {
					this.refreshEntryCold(entry, lazyFn, now);
				}
			} else {
				// Fresh new entry
				entry.pending = null;
				entry.createdAt = now;
				entry.valuePromise = Promise.resolve(lazyFn(key)).catch((err) => {
					entry.invalid = true;
					throw err;
				});
			}

			// Refresh the entries
			entry.invalid = false;
			this.cacheEntryHeap.updateItem(entry);
			this.refreshEntryHeap(now);
			return entry;
		}

		const entry: MarkOptional<CacheEntry<TKey, TValue>, 'valuePromise'> = {
			key,
			invalid: false,
			pending: null,
			createdAt: Date.now(),
		};
		entry.valuePromise = Promise.resolve(lazyFn(key)).catch((err) => {
			entry.invalid = true;
			throw err;
		});
		const result = entry as CacheEntry<TKey, TValue>;
		this.cacheEntryMap.set(key, result);
		this.cacheEntryHeap.push(result);
		this.refreshEntryHeap(now);
		return result;
	}

	/**
	 * Faz o refresh de uma entrada no cache
	 */
	private refreshEntryCold(
		entryParam: CacheEntry<TKey, TValue>,
		lazyFn: CacheFn<TKey, TValue>,
		now: number
	) {
		const entry = entryParam;
		if (!entry.pending) {
			const valuePromise = Promise.resolve(lazyFn(entry.key)).then(
				(newValue) => {
					if (entry.createdAt < now) {
						entry.invalid = false;
						entry.createdAt = now;
						entry.valuePromise = Promise.resolve(newValue);
						entry.pending = null;
						this.cacheEntryHeap.updateItem(entry);
						this.refresh();
					}
					return newValue;
				},
				(err) => {
					entry.pending = null;
					throw err;
				}
			);
			entry.pending = {
				value: valuePromise,
				createdAt: now,
			};
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
