import {
	SheetReaderData,
	SheetReaderHeaderMapBase,
	SheetReaderOptions,
} from './core/sheet-reader-types';
import { SheetReaderException } from './core/sheet-reader.exceptions';
import { sheetReaderForEach, SheetReaderItem } from './sheet-reader';
import { sheetReaderGetDefaultLogger } from './sheet-reader-defaults';

/**
 * Create a map function
 */
export async function sheetReaderMap<T, HeaderMap extends SheetReaderHeaderMapBase>(
	options: SheetReaderOptions<HeaderMap> & {
		map(
			data: SheetReaderData<HeaderMap>,
			item: SheetReaderItem<HeaderMap>
		): Promise<T | null | undefined> | T | null | undefined;
	}
) {
	const logger = options.logger ?? sheetReaderGetDefaultLogger();

	const result: T[] = [];
	await sheetReaderForEach({
		...options,
		async callback(item) {
			const value = await options.map(item.data, item);
			if (value != null) result.push(value);
		},
	});
	if (result.length <= 0) {
		const error = new SheetReaderException(`Nenhum valor foi importado`);
		if (logger) {
			logger.error(error);
		}
		throw error;
	}
	return result;
}
