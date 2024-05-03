export function isFindOperator(param: unknown): boolean {
	if (param && typeof param === 'object' && 'getSql' in param) {
		return true;
	}
	return false;
}
