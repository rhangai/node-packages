export function isFindOperator(param: any): boolean {
	if (param && typeof param === 'object' && 'getSql' in param) {
		return true;
	}
	return false;
}
