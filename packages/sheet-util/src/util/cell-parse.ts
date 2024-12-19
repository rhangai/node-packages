import { type CellObject, type NumberFormat } from 'xlsx';

export type CellParsed = {
	text: string;
	value: unknown;
};

// Faz o parse de uma celula
export function cellParse(cell: CellObject | undefined): CellParsed {
	if (cell == null) {
		return {
			text: '',
			value: null,
		};
	} else if (cell.t === 'b') {
		// Boolean type, 1 or ''
		return {
			text: cell.v ? `1` : '',
			value: !!cell.v,
		};
	} else if (cell.v instanceof Date) {
		// Date type, return YYYY-MM-DD formatted date
		return {
			text: dateFormat(cell.v),
			value: cell.v,
		};
	} else if (cell.t === 'n' && isRawNumberFmt(cell.z)) {
		// Number type without formatted type
		return {
			text: `${cell.v}`,
			value: cell.v,
		};
	}
	return {
		text: (cell.w ?? `${cell.v}`).trim(),
		value: cell.v,
	};
}

// Verifica se o número sendo formatado é puro
function isRawNumberFmt(fmt: NumberFormat | null | undefined) {
	if (!fmt) {
		return true;
	}
	if (typeof fmt === 'string') {
		if (fmt === '@' || fmt.toLowerCase() === 'general') {
			return true;
		}
	}
	return false;
}

function dateFormat(date: Date) {
	const year = date.getFullYear().toString().padStart(4, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDay().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
}
