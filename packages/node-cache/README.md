# @rhangai/cache

## Simple cache structure

```sh
yarn add @rhangai/cache
```

## Usage

```ts
import { ToString, ToInt, validate } from '@rhangai/validator';

class MyClass {
	@ToString()
	name!: string;

	@ToInt()
	age!: number;
}

async function test() {
	const result = await validate(MyClass, {
		name: 'John Doe',
		age: 100,
	});
	/*
	  MyClass { name: 'John Doe', age: 100 }
	*/
}
```
