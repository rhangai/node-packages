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
		map(data: SheetReaderData<HeaderMap>): Promise<T | null | undefined> | T | null | undefined;
	}
) {
	const result: T[] = [];
	await sheetReaderForEach({
		...options,
		async callback(item) {
			const value = await options.map(item.data);
			if (value != null) result.push(value);
		},
	});
	if (result.length <= 0) {
		throw new SheetReaderException(`Nenhum valor foi importado`);
	}
	return result;
}
