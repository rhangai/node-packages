import type { TestManagerE2E } from './plugin';

declare module '@rhangai/nest-test' {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface TestManager<TServices> {
		e2e(cb: (e2e: TestManagerE2E) => void): void;
	}
}
