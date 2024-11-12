import { type Result, resultError } from '@rhangai/core';
import {
	sheetRead,
	type SheetReadColumnsBase,
	type SheetReadItem,
	type SheetReadOptions,
} from './sheet-read';

export interface SheetReadMapOptions<T, Columns extends SheetReadColumnsBase>
	extends Omit<SheetReadOptions<Columns>, 'callback'> {
	/**
	 * Map every row of the sheet
	 */
	map: (item: SheetReadItem<Columns>) => T | null | Promise<T | null>;
}

/**
 * Read the sheet and map its rows
 */
export async function sheetReadMap<T, Columns extends SheetReadColumnsBase>(
	options: SheetReadMapOptions<T, Columns>,
): Promise<Result<T[]>> {
	const items: T[] = [];
	const result = await sheetRead({
		...options,
		async callback(item) {
			const mapped = await options.map(item);
			if (mapped != null) {
				items.push(mapped);
			}
		},
	});
	if (!result.success) {
		return result;
	}
	if (items.length <= 0) {
		return resultError(`Nenhum item processado`, `WORKSHEET_MAP_EMPTY`);
	}
	return { success: true, value: items };
}
