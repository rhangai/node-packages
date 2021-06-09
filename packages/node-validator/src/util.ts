export type Class<T> = { new (...args: any[]): T };

export function isPromiseLike(p: any): p is Promise<unknown> {
	if (p == null) return false;
	if (typeof p !== 'object') return false;
	return 'then' in p;
}

export function arrayMap<T, U>(
	array: T[],
	mapper: (item: T) => U | Promise<U>
): U[] | Promise<U[]> {
	const output: Array<U> = [];
	for (let i = 0; i < array.length; ++i) {
		const result = mapper(array[i]);
		if (isPromiseLike(result)) {
			return arrayMapAsync(array, output, result, i + 1, mapper);
		}
		output.push(result);
	}
	return output;
}

export async function arrayMapAsync<T, U>(
	array: T[],
	outputParam: U[],
	resultParam: Promise<U>,
	index: number,
	mapper: (item: T) => U | Promise<U>
): Promise<U[]> {
	const output = outputParam;
	const result = await resultParam;
	output.push(result);
	for (let i = index; i < array.length; ++i) {
		const itemResult = await mapper(array[i]);
		output.push(itemResult);
	}
	return output;
}
