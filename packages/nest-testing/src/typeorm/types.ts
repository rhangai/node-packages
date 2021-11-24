import type { EntityManager } from 'typeorm';

declare module '@rhangai/nest-testing/types' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface TestManager<TServices> {
		readonly entityManager: EntityManager;
	}
}
