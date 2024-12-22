import { describe, it } from 'vitest';
import { promiseDelay } from '../../src/core/async';
import { queueRunner } from '../../src/util/queue-runner';

describe('queueRunner', () => {
	it('should run', async () => {
		await queueRunner({
			async *producer() {
				yield 'Ok';
				await promiseDelay(0);
				yield ['Ok2', 'OK3'];
			},
			async consume() {
				await promiseDelay(0);
			},
		});
	});
});
