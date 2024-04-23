# @rhangai/cache

## Simple cache structure

```sh
yarn add @rhangai/cache
```

## Simple Usage

```ts
import { Cache } from '@rhangai/cache';

const cache = new Cache<number, User>({
	duration: 30000,
	durationUntilCold: 25000,
});
function loadUser(id: number) {
	/*
		The cache will return the same item as long as the duration is less than the time given
		If the cache is cold (not expired, only old). The old value will be returned but a new value will be requested
	*/
	return cache.get(id, async () => {
		const user = await loadUserFromDb(id);
		return user;
	});
}
const user = await loadUser(1);
```
