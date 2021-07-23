import {
	SheetReaderData,
	SheetReaderHeaderMapBase,
	SheetReaderOptions,
} from './core/sheet-reader-types';
import { SheetReaderException } from './core/sheet-reader.exceptions';
import { sheetReaderForEach } from './sheet-reader';

/**
 * Create a map function
 */
export async function sheetReaderMap<T, HeaderMap extends SheetReaderHeaderMapBase>(
	options: SheetReaderOptions<HeaderMap> & {
		map(data: SheetReaderData<HeaderMap>): Promise<T> | T;
	}
) {
	const result: T[] = [];
	await sheetReaderForEach({
		...options,
		async callback(item) {
			result.push(await options.map(item.data));
		},
	});
	if (result.length <= 0) {
		throw new SheetReaderException(`Nenhum valor foi importado`);
	}
	return result;
}
