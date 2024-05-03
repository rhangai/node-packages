import { fileInputDispatch, streamToBuffer } from '@rhangai/core/node';
import dayjs from 'dayjs';
import XLSX, { type CellObject } from 'xlsx';
import type {
	SheetReaderData,
	SheetReaderHeaderItem,
	SheetReaderHeaderItemInput,
	SheetReaderHeaderMapBase,
	SheetReaderOptions,
	SheetReaderValues,
} from './core/sheet-reader-types';
import { SheetReaderException } from './core/sheet-reader.exceptions';
import { sheetReaderGetDefaultLogger } from './sheet-reader-defaults';

export type SheetReaderItem<HeaderMap extends SheetReaderHeaderMapBase> = {
	row: number;
	data: SheetReaderData<HeaderMap>;
	values: SheetReaderValues<HeaderMap>;
};

export type SheetReaderItemParam = {
	bail: (err: Error) => never;
};

export type SheetReaderForEachOptions<HeaderMap extends SheetReaderHeaderMapBase> =
	SheetReaderOptions<HeaderMap> & {
		callback: (
			item: SheetReaderItem<HeaderMap>,
			param: SheetReaderItemParam,
		) => void | Promise<void>;
	};
/**
 * Pega um header como se fosse um objeto para normalizar as opções
 */
function sheetReaderGetHeaderItem(
	input: SheetReaderHeaderItemInput | undefined,
): SheetReaderHeaderItem {
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
	},
): Iterable<{
	row: number;
	data: SheetReaderData<HeaderMap>;
	values: SheetReaderValues<HeaderMap>;
}> {
	type HeaderMapItem = {
		key: string;
		column: number | null;
	};
	const headerMap: HeaderMapItem[] = [];
	const errorList: string[] = [];
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
		const headerCells: {
			cell: XLSX.CellObject;
			column: number;
			text: string;
			normalizedText: string;
		}[] = [];
		for (let colNum = range.s.c; colNum <= range.e.c; ++colNum) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const cell: CellObject | undefined =
				worksheet[XLSX.utils.encode_cell({ r: 0, c: colNum })];
			if (!cell) {
				continue;
			}
			const { text } = parseCell(cell);
			headerCells.push({
				cell,
				column: colNum,
				text,
				normalizedText: normalizeText(text),
			});
		}

		// eslint-disable-next-line guard-for-in
		for (const key in headerMapParam) {
			const value = headerMapParam[key];
			if (value == null) {
				continue;
			}
			const header = sheetReaderGetHeaderItem(value);
			const headerName = header.name ?? key;
			const normalizedName = normalizeText(headerName);
			const headerColumn =
				typeof header.column === 'string'
					? XLSX.utils.decode_col(header.column)
					: header.column;

			let cellItem;
			let cellColumn: number | null;
			if (headerColumn == null) {
				cellItem = headerCells.find((item) => item.normalizedText === normalizedName);
				if (!cellItem && !header.optional) {
					errorList.push(`Não foi possível localizar um cabeçalho para ${headerName}`);
					continue;
				}
				cellColumn = cellItem?.column ?? null;
			} else {
				cellItem = headerCells.find((item) => item.column === headerColumn);
				cellColumn = headerColumn;
				if (header.validateName !== false && cellItem?.normalizedText !== normalizedName) {
					errorList.push(
						`Cabeçalho esperado: ${headerName}. Cabeçalho: ${cellItem?.text}`,
					);
					continue;
				}
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
		const rowData: Record<string, string> = {};
		const rowValues: Record<string, unknown> = {};
		let hasValues = false as boolean;
		headerMap.forEach((item) => {
			if (item.column == null) {
				return;
			}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			const cell: CellObject | undefined =
				worksheet[XLSX.utils.encode_cell({ r: rowNum, c: item.column })];
			const { text, value } = parseCell(cell);
			rowData[item.key] = text;
			rowValues[item.key] = value;
			if (value) {
				hasValues = true;
			}
		});
		if (!hasValues) {
			return null;
		}
		return {
			data: rowData as SheetReaderData<HeaderMap>,
			values: rowValues as SheetReaderValues<HeaderMap>,
		};
	};

	for (let i = initialRow; i <= range.e.r; ++i) {
		const row = rowGetter(i);
		if (row == null) {
			continue;
		}
		yield {
			row: i,
			data: row.data,
			values: row.values,
		};
	}
}

/**
 * Lê cada item de uma planilha
 * @param options
 */
export async function sheetReaderForEach<HeaderMap extends SheetReaderHeaderMapBase>(
	options: SheetReaderForEachOptions<HeaderMap>,
) {
	const logger = options.logger ?? sheetReaderGetDefaultLogger();
	const workbookOptions: XLSX.ParsingOptions = {
		cellNF: true,
		cellDates: true,
	};
	const workbook = await fileInputDispatch(options.input, {
		buffer: (buffer) => XLSX.read(buffer, workbookOptions),
		stream: async (stream) => {
			const buffer = await streamToBuffer(stream);
			return XLSX.read(buffer, workbookOptions);
		},
		path: (filePath) => XLSX.readFile(filePath, workbookOptions),
	});

	const worksheet = (() => {
		const { sheet } = options;
		if (!sheet) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return workbook.Sheets[workbook.SheetNames[0]!];
		}
		if (typeof sheet === 'string') {
			return workbook.Sheets[sheet];
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return workbook.Sheets[workbook.SheetNames[sheet]!];
	})();
	if (!worksheet) {
		const error = new SheetReaderException(`Planilha inválida`);
		if (logger) {
			logger.error(error);
		}
		throw error;
	}
	const rowIterator = sheetReaderCreateRowIterator(worksheet, options.header, {
		validateNames: options.headerValidateNames,
	});

	// Errors
	const state = {
		running: true,
		hasErrors: false,
		errorList: [] as Error[],
		errorMessageList: [] as string[],
	};

	const callbackParam = {
		bail(err: Error): never {
			state.running = false;
			throw err;
		},
	};

	for (const item of rowIterator) {
		// If bailed, then stop the execution
		if (!state.running) {
			break;
		}
		try {
			await options.callback(item, callbackParam);
		} catch (e: unknown) {
			if (logger) {
				logger.error(e);
			}
			const error = e as Error;
			state.hasErrors = true;
			state.errorList.push(error);
			const errorText = options.error?.(error) ?? errorDefaultText(e);
			if (errorText !== false) {
				state.errorMessageList.push(
					[`Erro na linha ${item.row + 1}`, errorText].filter(Boolean).join(': '),
				);
			}
		}
	}
	if (state.hasErrors) {
		throw new SheetReaderException(
			[`Erro ao processar planilha`, options.name].filter(Boolean).join(' - '),
			state.errorMessageList,
			state.errorList,
		);
	}
}

function errorDefaultText(e: unknown): string {
	if (!e || typeof e !== 'object') {
		return '';
	}
	if ('getPublicErrorMessage' in e && typeof e.getPublicErrorMessage === 'function') {
		return e.getPublicErrorMessage() as string;
	}
	return '';
}

// Normalize a text to load
function normalizeText(key: string): string {
	return key
		.normalize('NFD')
		.replace(/[^a-zA-Z0-9]/g, '')
		.toLowerCase();
}

type ParsedCell = {
	text: string;
	value: unknown;
};

// Faz o parse de uma celula
function parseCell(cell: CellObject | undefined): ParsedCell {
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
			text: dayjs(cell.v).format('YYYY-MM-DD'),
			value: cell.v,
		};
	} else if (cell.t === 'n' && !cell.z) {
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
