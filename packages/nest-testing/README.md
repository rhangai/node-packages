# @rhangai/nest-testing

## Installation

```sh
yarn add @rhangai/nest-testing @nestjs/testing jest
```

## Usage

Create your test factory

```ts
import { createTestFactory } from '@rhangai/nest-testing';

export const createTest = createTestFactory({
	imports: [],
	plugins: [],
});
```

Create a test

```ts
import { createTest } from './somewhere';
import { SomethingService } from './some.service';

describe('MyService', () => {
	const t = createTest({
		services: {
			something: SomethingService,
		},
	});

	it('should do something', () => {
		t.services.something.doSomething();
	});
});
```

## Plugins

### e2e

#### Setup

```ts
import { testPluginE2e } from '@rhangai/nest-testing/lib/e2e';

export const createTest = createTestFactory({
	plugins: [testPluginE2e()],
});
```

#### Usage

```ts
t.e2t((e2e) => {
	it('graphql', () => {
		await e2e.graphql({
			query: (gql) => gql`
				query ($id: Int!) {
					item(id: $id) {
						id
						name
					}
				}
			`,
			variables: {
				id: 1,
			},
			expect: {
				item: {
					id: 1,
					name: 'Box',
				},
			},
		});
	});
});
```

### typeorm

#### Setup

```ts
import { testPluginTypeorm } from '@rhangai/nest-testing/lib/typeorm';

export const createTest = createTestFactory({
	plugins: [testPluginTypeorm()],
});
```

#### Usage

Now you can use the typeorm module

```ts
const entities = await t.entityManager.find(EntityClass);
```
