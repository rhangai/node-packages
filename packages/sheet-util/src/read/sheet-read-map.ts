import { type SheetResult } from '../result';
import { type SheetReadItem, type SheetReadOptions, sheetReadSafe } from './sheet-read';
import { SheetReadError, SheetReadErrorCode } from './sheet-read-error';

export interface SheetReadMapOptions<T, TKeys extends string>
	extends Omit<SheetReadOptions<TKeys>, 'callback'> {
	/**
	 * Map every row of the sheet
	 */
	map: (item: SheetReadItem<TKeys>) => T | null | Promise<T | null>;
}

/**
 * Read the sheet and map its rows. Safe version returing a result
 */
export async function sheetReadMapSafe<T, TKeys extends string>(
	options: SheetReadMapOptions<T, TKeys>,
): Promise<SheetResult<T[]>> {
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
		return {
			success: false,
			error: new SheetReadError(SheetReadErrorCode.WORKSHEET_EMPTY, 'Nenhum item processado'),
		};
	}
	return { success: true, data: items };
}

/**
 * Read the sheet and map its rows
 */
export async function sheetReadMap<T, TKeys extends string>(
	options: SheetReadMapOptions<T, TKeys>,
): Promise<T[]> {
	const result = await sheetReadMapSafe(options);
	if (!result.success) {
		throw result.error;
	}
	return result.data;
}
