import { Cache } from './cache';

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
			durationUntilCold: 8000,
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
});
