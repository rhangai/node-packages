import { type Result, resultError } from '@rhangai/core';
import {
	type SheetReadColumnsBase,
	type SheetReadItem,
	type SheetReadOptions,
	sheetReadSafe,
} from './sheet-read';
import { SheetReaderError } from './sheet-read-error';

export interface SheetReadMapOptions<T, Columns extends SheetReadColumnsBase>
	extends Omit<SheetReadOptions<Columns>, 'callback'> {
	/**
	 * Map every row of the sheet
	 */
	map: (item: SheetReadItem<Columns>) => T | null | Promise<T | null>;
}

/**
 * Read the sheet and map its rows. Safe version returing a result
 */
export async function sheetReadMapSafe<T, Columns extends SheetReadColumnsBase>(
	options: SheetReadMapOptions<T, Columns>,
): Promise<Result<T[]>> {
	const items: T[] = [];
	const result = await sheetReadSafe({
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

/**
 * Read the sheet and map its rows
 */
export async function sheetReadMap<T, Columns extends SheetReadColumnsBase>(
	options: SheetReadMapOptions<T, Columns>,
): Promise<T[]> {
	const result = await sheetReadMapSafe(options);
	if (!result.success) {
		throw new SheetReaderError(result.errorCode, result.error, result.errors);
	}
	return result.value;
}
