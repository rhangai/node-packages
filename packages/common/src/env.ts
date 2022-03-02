export function env(name: string): string;
export function env(name: string, defaultValue: string): string;
export function env(name: string, defaultValue: null): string | null;
export function env(name: string, defaultValue?: string | null): string | null {
	if (!(name in process.env)) {
		if (defaultValue === undefined) throw new Error(`Variável ${name} não definida`);
		return defaultValue;
	}
	const value = process.env[name];
	if (!value) {
		if (defaultValue === undefined) throw new Error(`Variável ${name} não definida`);
		return defaultValue;
	}
	return value;
}

export function envInt(name: string, defaultValue = 0): number {
	const value = env(name, '');
	if (!value) return defaultValue;
	const valueInt = parseInt(value, 10);
	if (!Number.isFinite(valueInt))
		throw new Error(`Variável ${name} com valor inválido. Esperado int.`);
	return valueInt;
}

export function envBool(name: string, defaultValue?: boolean): boolean {
	const value = env(name, '');
	if (!value && defaultValue != null) return !!defaultValue;
	if (!value || value === '0' || value === 'false') return false;
	if (value === '1' || value === 'true') return true;
	throw new Error(`Variável ${name} com valor inválido. Esperado boolean.`);
}
