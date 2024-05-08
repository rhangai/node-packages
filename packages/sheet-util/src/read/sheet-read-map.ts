import { type Result, resultError } from '@rhangai/core';
import {
	sheetRead,
	type SheetReadColumnsBase,
	type SheetReadItem,
	type SheetReadOptions,
} from './sheet-read';

// Base options are the sheetRead options without the callback
type BaseOptions<Columns extends SheetReadColumnsBase> = Omit<
	SheetReadOptions<Columns>,
	'callback'
>;

export type SheetReadMapOptions<T, Columns extends SheetReadColumnsBase> = BaseOptions<Columns> & {
	/**
	 * Map every row of the sheet
	 */
	map(this: void, item: SheetReadItem<Columns>): T | null | Promise<T | null>;
};

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
