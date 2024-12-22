type MaybePromise<T> = PromiseLike<T> | T;
type MaybeAsyncIterator<T> = Iterator<T> | AsyncIterator<T>;

interface QueueRunnerOptions<T> {
	/**
	 * Number of concurrent tasks
	 */
	concurrency?: number;
	/**
	 * Create the items to be consumed
	 *
	 * If the producer returns null, it is then stopped and can be
	 */
	producer: () => MaybeAsyncIterator<T | readonly T[]>;
	/**
	 * The consumer function
	 *
	 * Process the item created by the prodocuer
	 */
	consume: (item: T) => MaybePromise<void>;
}

/**
 * Runs some tasks in parallel
 *
 * Ensures only one producer is running at a time
 * Consumes multiple items concurrently
 */
export async function queueRunner<T>(options: QueueRunnerOptions<T>): Promise<void> {
	const itemsQueue: T[] = [];
	let producerDone = false;
	let producerFn: (() => MaybePromise<IteratorResult<T | readonly T[]>>) | undefined;
	const error: unknown = null;

	/**
	 * Produces items to be consumed
	 */
	async function doProduce() {
		if (producerDone) {
			return;
		}

		if (!producerFn) {
			const producer = options.producer();
			producerFn = producer.next.bind(producer);
		}

		const result = await Promise.resolve().then(producerFn);
		if (result.done) {
			producerDone = true;
			return;
		}

		const items = result.value;
		if (Array.isArray(items)) {
			itemsQueue.push(...items);
		} else {
			itemsQueue.push(items as T);
		}
	}

	/*
		Makes sure there is only one producer running at a tima
	*/
	let currentProducer: Promise<void> | null = null;
	function produce() {
		if (!currentProducer) {
			currentProducer = doProduce().finally(() => {
				currentProducer = null;
			});
		}
		return currentProducer;
	}

	/**
	 * Consumes items until the queue is gone
	 */
	async function consumerWorker() {
		// eslint-disable-next-line no-unmodified-loop-condition
		while (!producerDone || itemsQueue.length > 0) {
			try {
				if (itemsQueue.length <= 0) {
					await produce();
				}
				const item = itemsQueue.shift();
				if (item) {
					await options.consume(item);
				}
			} catch (_err: unknown) {
				/* Ignore errors */
			}
		}
	}

	const runners: Array<Promise<void>> = [];
	const concurrency = Math.max(options.concurrency ?? 4, 1);
	for (let i = 0; i < concurrency; ++i) {
		runners.push(consumerWorker());
	}

	await Promise.all(runners);
	if (error) {
		// eslint-disable-next-line @typescript-eslint/only-throw-error
		throw error;
	}
}
