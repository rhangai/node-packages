export type Class<T> = { new (...args: any[]): T };

export function isPromiseLike(p: any): p is Promise<unknown> {
	if (p == null) return false;
	if (typeof p !== 'object') return false;
	if (typeof p.then !== 'function') return false;
	return true;
}
