export type MaybePromise<T> = PromiseLike<T> | T;

interface PromiseResolvers<T> {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (err?: unknown) => void;
}

/**
 * Create a promise with resolvers
 * @returns
 */
export function promiseResolvers<T>(): PromiseResolvers<T> {
	const out: Partial<PromiseResolvers<T>> = {};
	out.promise = new Promise((resolve, reject) => {
		out.resolve = resolve;
		out.reject = reject;
	});
	return out as PromiseResolvers<T>;
}

/**
 * Delay function as promise
 */
export function promiseDelay(delay: number): Promise<void> {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, delay);
	});
}
