import { fileInputDispatch } from '@rhangai/common';
import dayjs from 'dayjs';
import XLSX, { CellObject } from 'xlsx';
import {
	SheetReaderData,
	SheetReaderHeaderItem,
	SheetReaderHeaderItemInput,
	SheetReaderHeaderMapBase,
	SheetReaderOptions,
} from './core/sheet-reader-types';
import { SheetReaderException } from './core/sheet-reader.exceptions';

export type SheetReaderItem<HeaderMap extends SheetReaderHeaderMapBase> = {
	row: number;
	data: SheetReaderData<HeaderMap>;
};

export type SheetReaderForEachOptions<HeaderMap extends SheetReaderHeaderMapBase> =
	SheetReaderOptions<HeaderMap> & {
		callback: (item: SheetReaderItem<HeaderMap>) => void | Promise<void>;
	};

/**
 * Pega um header como se fosse um objeto para normalizar as opções
 */
function sheetReaderGetHeaderItem(input: SheetReaderHeaderItemInput): SheetReaderHeaderItem {
	if (input == null || typeof input === 'string' || typeof input === 'number') {
		return { column: input };
	}
	return input;
}

/**
 * Cria o leitor de row da planilha
 *
 * Retorna uma função que pode ser usada para pegar os valores de uma row de acordo com o header
 *
 * const getter = sheetReaderCreateRowGetter(headerRow, {
 *    id: 'A',
 *    nome: 'B',
 * });
 * const data = getter(row); // { id: string, nome: string }
 */
function* sheetReaderCreateRowIterator<HeaderMap extends SheetReaderHeaderMapBase>(
	worksheet: XLSX.Sheet,
	headerMapParam: HeaderMap,
	options: {
		validateNames?: boolean;
	}
) {
	type HeaderMapItem = {
		key: string;
		column: number;
	};
	const headerMap: HeaderMapItem[] = [];
	const errorList: string[] = [];
	const range = XLSX.utils.decode_range(worksheet['!ref']!);

	let initialRow = 0;
	if (options.validateNames === false) {
		// eslint-disable-next-line guard-for-in
		for (const key in headerMapParam) {
			const header = sheetReaderGetHeaderItem(headerMapParam[key]);
			if (!header.column) {
				errorList.push(`Não há coluna para a chave ${key}.`);
				continue;
			}
			const column =
				typeof header.column === 'string'
					? XLSX.utils.decode_col(header.column)
					: header.column;
			headerMap.push({
				key,
				column,
			});
		}
	} else {
		initialRow = 1;
		const headerCells: Array<{
			cell: XLSX.CellObject;
			column: number;
			text: string;
			normalizedText: string;
		}> = [];
		for (let colNum = range.s.c; colNum <= range.e.c; ++colNum) {
			const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: colNum })];
			const text = formatCell(cell);
			headerCells.push({
				cell,
				column: colNum,
				text,
				normalizedText: normalizeText(text),
			});
		}

		// eslint-disable-next-line guard-for-in
		for (const key in headerMapParam) {
			const header = sheetReaderGetHeaderItem(headerMapParam[key]);
			const headerName = header.name ?? key;
			const normalizedName = normalizeText(headerName);
			const headerColumn =
				typeof header.column === 'string'
					? XLSX.utils.decode_col(header.column)
					: header.column;

			let cellItem;
			let cellColumn: number;
			if (headerColumn == null) {
				cellItem = headerCells.find((item) => item.normalizedText === normalizedName);
				if (!cellItem) {
					errorList.push(`Não foi possível localizar um cabeçalho para ${headerName}`);
					continue;
				}
				cellColumn = cellItem.column;
			} else {
				cellItem = headerCells.find((item) => item.column === headerColumn);
				cellColumn = headerColumn;
			}
			if (header.validateName !== false && cellItem?.normalizedText !== normalizedName) {
				errorList.push(`Cabeçalho esperado: ${headerName}. Cabeçalho: ${cellItem?.text}`);
				continue;
			}

			headerMap.push({
				key,
				column: cellColumn,
			});
		}
	}

	if (errorList.length > 0) {
		throw new SheetReaderException(`Cabeçalho inválido`, errorList);
	}

	const rowGetter = (rowNum: number) => {
		const rowValues: Record<string, string> = {};
		let hasValues = false;
		headerMap.forEach((item) => {
			const cell = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: item.column })];
			const value = formatCell(cell);
			rowValues[item.key] = value;
			if (value) hasValues = true;
		});
		if (!hasValues) return null;
		return rowValues as SheetReaderData<HeaderMap>;
	};

	for (let i = initialRow; i <= range.e.r; ++i) {
		const rowValues = rowGetter(i);
		if (rowValues == null) continue;
		yield {
			row: i,
			data: rowValues,
		};
	}
}

/**
 * Lê cada item de uma planilha
 * @param options
 */
export async function sheetReaderForEach<HeaderMap extends SheetReaderHeaderMapBase>(
	options: SheetReaderForEachOptions<HeaderMap>
) {
	const workbook = await fileInputDispatch(options.input, {
		buffer: (buffer) => XLSX.read(buffer),
		stream: async (stream) => {
			const buffer = await new Promise((resolve, reject) => {
				const buffers: Buffer[] = [];
				stream.on('data', (chunk) => {
					buffers.push(chunk);
				});
				stream.on('error', (err) => {
					reject(err);
				});
				stream.on('end', () => {
					resolve(Buffer.concat(buffers));
				});
			});
			return XLSX.read(buffer);
		},
		path: (filePath) => XLSX.readFile(filePath),
	});

	const worksheet = (() => {
		const { sheet } = options;
		if (!sheet) return workbook.Sheets[workbook.SheetNames[0]];
		if (typeof sheet === 'string') {
			return workbook.Sheets[sheet];
		}
		return workbook.Sheets[workbook.SheetNames[sheet]];
	})();
	if (!worksheet) throw new SheetReaderException(`Planilha inválida`);
	const rowIterator = sheetReaderCreateRowIterator(worksheet, options.header, {
		validateNames: options.headerValidateNames,
	});

	const errorList: Error[] = [];
	const errorMessageList: string[] = [];
	for (const item of rowIterator) {
		try {
			// eslint-disable-next-line no-await-in-loop
			await options.callback(item);
		} catch (e: any) {
			errorList.push(e);
			const errorText = options.error?.(e) ?? errorDefaultText(e);
			if (errorText !== false)
				errorMessageList.push(
					[`Erro na linha ${item.row}`, errorText].filter(Boolean).join(': ')
				);
		}
	}
	if (errorMessageList.length > 0) {
		throw new SheetReaderException(
			[`Erro ao processar planilha`, options.name].filter(Boolean).join(' - '),
			errorMessageList,
			errorList
		);
	}
}

function errorDefaultText(e: any) {
	if (!e || typeof e !== 'object') return '';
	if (typeof e.getPublicErrorMessage === 'function') return e.getPublicErrorMessage();
	return '';
}

// Normalize a text to load
function normalizeText(key: string): string {
	return key
		.normalize('NFD')
		.replace(/[^a-zA-Z0-9]/g, '')
		.toLowerCase();
}

// Format a cell
function formatCell(cell: CellObject | undefined): string {
	if (cell == null) return '';
	if (cell.t === 'b') {
		return cell.v ? `1` : '';
	} else if (cell.t === 'n') {
		return `${cell.v}`;
	} else if (cell.v instanceof Date) {
		return dayjs(cell.v).format('YYYY-MM-DD');
	}
	return cell.w ?? `${cell.v}`;
}
