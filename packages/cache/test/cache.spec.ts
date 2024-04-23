import { Cache } from '../src/cache';

describe('Cache', () => {
	jest.useFakeTimers();

	it('should return the same value when hot', async () => {
		const cache = new Cache();
		const getter = () => ({});
		const item1 = await cache.get(0, getter);
		const item2 = await cache.get(0, getter);
		expect(item1).toBe(item2);
	});

	it('should delete items from cache', async () => {
		const cache = new Cache();
		const getter = () => ({});
		const item1 = await cache.get(0, getter);
		cache.delete(0);
		expect(cache.hasEntry(0)).toBe(false);
		const item2 = await cache.get(0, getter);
		expect(item1).not.toBe(item2);
	});

	it('should expire', async () => {
		const cache = new Cache({
			duration: 100,
		});

		let globalId = 0;
		const getter = jest.fn(() => {
			const id = globalId;
			globalId += 1;
			return { id };
		});

		jest.setSystemTime(0);
		const item1 = await cache.get(0, getter);
		const same1 = await cache.get(0, getter);
		jest.setSystemTime(200);
		const item2 = await cache.get(0, getter);
		const same2 = await cache.get(0, getter);
		jest.setSystemTime(400);
		const item3 = await cache.get(0, getter);
		const same3 = await cache.get(0, getter);
		jest.setSystemTime(600);

		expect(item1).not.toBe(item2);
		expect(item1).not.toBe(item3);
		expect(item2).not.toBe(item3);

		expect(item1).toBe(same1);
		expect(item2).toBe(same2);
		expect(item3).toBe(same3);
		expect(getter).toBeCalledTimes(3);
	});

	it('should return the same value when cold, but triggers an update', async () => {
		const cache = new Cache({
			duration: 10000,
			durationUntilCold: 100,
		});
		const getter = jest.fn(() => ({}));

		jest.setSystemTime(0);
		const original = await cache.get(0, getter);

		jest.setSystemTime(500);
		const coldCache1 = await cache.get(0, getter);
		const coldCache2 = await cache.get(0, getter);

		jest.setSystemTime(300000);
		cache.refresh();
		expect(cache.size()).toBe(0);

		expect(original).toBe(coldCache1);
		expect(original).not.toBe(coldCache2);
		expect(getter).toBeCalledTimes(2);
	});

	it('should keep items in cache', async () => {
		const cache = new Cache({
			duration: 10000,
			durationUntilCold: 7000,
		});

		const getter = jest.fn(() => ({}));

		// Must have all items in cache
		jest.setSystemTime(0);
		await cache.get(1, getter);
		await cache.get(2, getter);
		await cache.get(3, getter);
		cache.delete(2);
		expect(cache.hasEntry(1)).toBe(true);
		expect(cache.hasEntry(2)).toBe(false);
		expect(cache.hasEntry(3)).toBe(true);
		expect(cache.size()).toBe(2);

		// Still, all 3 items must be in cache
		jest.setSystemTime(8000);
		await cache.get(1, getter);
		await cache.get(1, getter);
		await cache.get(1, getter);
		expect(cache.size()).toBe(2);
		expect(cache.hasEntry(1)).toBe(true);
		expect(cache.hasEntry(2)).toBe(false);
		expect(cache.hasEntry(3)).toBe(true);

		// Since accessed the entry 1 on 5000, it must still be cached
		jest.setSystemTime(11000);
		await cache.get(1, getter);
		await cache.get(1, getter);
		await cache.get(1, getter);
		cache.refresh();
		expect(cache.size()).toBe(1);
		expect(cache.hasEntry(1)).toBe(true);
		expect(cache.hasEntry(2)).toBe(false);
		expect(cache.hasEntry(3)).toBe(false);

		// 4 times the getter will be called (3 times initially, 1 time when cold reloading)
		expect(getter).toBeCalledTimes(4);
	});

	it('should update cache when cold', async () => {
		const cache = new Cache({
			duration: 10000,
			durationUntilCold: 8000,
		});

		// Initial cache
		jest.setSystemTime(0);
		const deferred1 = createDeferred();
		const item01 = cache.get(0, () => deferred1.promise);
		const item02 = cache.get(0, () => deferred1.promise);
		deferred1.resolve({});
		expect(await item01).toBe(await item02);
		expect(cache.size()).toBe(1);

		// Hot item
		jest.setSystemTime(9000);
		const deferred2 = createDeferred();
		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		cache.get(0, () => deferred2.promise);

		jest.setSystemTime(12000);
		const item11 = cache.get(0, () => null);
		const item12 = cache.get(0, () => null);
		deferred2.resolve({});
		expect(await item11).toBe(deferred2.value);
		expect(await item11).toBe(await item12);
		expect(cache.size()).toBe(1);

		jest.setSystemTime(20000);
		cache.refresh();
		expect(cache.size()).toBe(0);
	});

	it('should expire the cache even when cold', async () => {
		const cache = new Cache({
			duration: 10000,
			durationUntilCold: 8000,
		});

		// Initial cache
		jest.setSystemTime(0);
		const deferred1 = createDeferred();
		const item01 = cache.get(0, () => deferred1.promise);
		jest.setSystemTime(9000);
		const item02 = cache.get(0, () => ({}));

		// Initial cache
		jest.setSystemTime(20000);
		const item11 = cache.get(0, () => null);
		jest.setSystemTime(20100);
		const item12 = cache.get(0, () => 3);
		deferred1.resolve({});
		expect(await item01).toBe(deferred1.value);
		expect(await item02).toBe(deferred1.value);
		expect(await item11).toBe(null);
		expect(await item12).toBe(null);
	});
});

type Deferred<T> = {
	value: T | undefined;
	resolve: (value: T) => void;
	reject: (err: Error) => void;
	promise: Promise<T>;
};

function createDeferred<T>() {
	const deferred: Partial<Deferred<T>> = {
		value: undefined,
	};
	deferred.promise = new Promise<T>((resolve, reject) => {
		deferred.resolve = (value) => {
			deferred.value = value;
			resolve(value);
		};
		deferred.reject = reject;
	});
	return deferred as Deferred<T>;
}
