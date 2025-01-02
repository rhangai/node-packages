import XLSX from 'xlsx';
import { type Result, resultError } from '@rhangai/core';
import { type Column } from '../util/column';
import { normalizeText } from '../util/normalize-text';
import { SheetReaderError } from './sheet-read-error';
import {
	sheetReadRaw,
	type SheetReadRawInputOptions,
	type SheetReadRawItem,
} from './sheet-read-raw';

type SheetReadColumnBase = number | Column;

export type SheetReadColumn =
	| SheetReadColumnBase
	| {
			column: SheetReadColumnBase;
			text?: string;
	  };

export interface SheetReadItem<TKeys extends string> extends SheetReadRawItem {
	/**
	 * The data of the row read
	 */
	data: Record<TKeys, string>;
	/**
	 * The header item
	 */
	header: Record<TKeys, string>;
	/**
	 * The header raw data
	 */
	headerRawData: string[];
}

export interface SheetReadOptions<TKeys extends string> extends SheetReadRawInputOptions {
	/**
	 * Columns definitions to read
	 */
	columns: Record<TKeys, SheetReadColumn>;
	/**
	 * Sheet without header. The first row is read as data and there will be no validation
	 */
	noHeader?: boolean;
	/**
	 * Validate the header texts
	 */
	headerValidate?: boolean | ((header: Record<TKeys, string>) => string[] | null);
	/**
	 * Does not return an error when there is no data
	 */
	allowNoData?: boolean;
	/**
	 * Callback to be invoked on every row of the sheet
	 */
	callback: (item: SheetReadItem<TKeys>) => void | Promise<void>;
}

/**
 * Column details after reading from the sheet
 */
interface ColumnDetails<TKeys extends string> {
	/**
	 * Index of the column
	 */
	index: number;
	/**
	 * The name of the column
	 */
	column: Column;
	/**
	 * The key
	 */
	key: TKeys;
	/**
	 * Contents of the cell text
	 */
	text: string;
}

/**
 * Read the sheet and returns a simple result type
 */
export async function sheetReadSafe<TKeys extends string>(
	options: SheetReadOptions<TKeys>,
): Promise<Result<void>> {
	type HeaderState = {
		header: Record<TKeys, string>;
		headerRawData: string[];
		columns: Array<ColumnDetails<TKeys>>;
	};
	let headerState: HeaderState | null = null;
	function headerParse(
		rawData: string[],
		headerValidate: SheetReadOptions<TKeys>['headerValidate'],
	): Result<void> {
		const columns: Array<ColumnDetails<TKeys>> = [];
		for (const [columnKey, column] of Object.entries<SheetReadColumn>(options.columns)) {
			if (typeof column === 'object') {
				const index = decodeCol(column.column);
				columns.push({
					index,
					column: XLSX.utils.encode_col(index) as Column,
					key: columnKey as TKeys,
					text: column.text ?? columnKey,
				});
			} else {
				const index = decodeCol(column);
				columns.push({
					index,
					column: XLSX.utils.encode_col(index) as Column,
					key: columnKey as TKeys,
					text: columnKey,
				});
			}
		}
		const header = createFromRawData(columns, rawData);
		if (headerValidate !== false) {
			let errors: string[] | null;
			if (typeof headerValidate === 'function') {
				errors = headerValidate(header);
			} else {
				errors = headerValidateDefault(columns, rawData);
			}
			if (errors && errors.length > 0) {
				return resultError('Erro ao ler cabeçalho', 'WORKSHEET_READ_COLUMN', errors);
			}
		}
		headerState = {
			header,
			headerRawData: rawData,
			columns,
		};
		return { success: true };
	}

	// There is no header
	if (options.noHeader) {
		const result = headerParse([], false);
		if (!result.success) {
			return result;
		}
	}

	let rowsRead = 0;
	const result = await sheetReadRaw({
		...options,
		callback(item) {
			if (!headerState) {
				const headerResult = headerParse(item.rawData, options.headerValidate);
				if (!headerResult.success) {
					item.bail(headerResult);
				}
				return;
			}

			rowsRead += 1;
			return options.callback({
				...item,
				data: createFromRawData(headerState.columns, item.rawData),
				header: headerState.header,
				headerRawData: headerState.headerRawData,
			});
		},
	});
	if (!result.success) {
		return result;
	}
	if (rowsRead <= 0 && !options.allowNoData) {
		return resultError(`Nenhum item foi processado. Planilha vazia`, `WORKSHEET_EMPTY`);
	}
	return { success: true };
}

/**
 * Read the sheet and returns a simple result type
 */
export async function sheetRead<TKeys extends string>(
	options: SheetReadOptions<TKeys>,
): Promise<void> {
	const result = await sheetReadSafe(options);
	if (!result.success) {
		throw new SheetReaderError(
			result.errorCode ?? 'WORKSHEET_INVALID',
			result.error ?? 'Erro ao ler a planilha',
			result.errors,
		);
	}
}

/// Create the data
function createFromRawData<TKeys extends string>(
	columns: Array<ColumnDetails<TKeys>>,
	rawData: string[],
): Record<TKeys, string> {
	const data: Partial<Record<TKeys, string>> = {};
	for (const info of columns) {
		data[info.key] = rawData[info.index] ?? '';
	}
	return data as Record<TKeys, string>;
}

/// Validates the header and returning an array of erros
function headerValidateDefault<TKeys extends string>(
	columnsInfos: Array<ColumnDetails<TKeys>>,
	rawData: string[],
): string[] {
	const errors: string[] = [];
	for (const info of columnsInfos) {
		const cellText = rawData[info.index];
		if (!cellText) {
			errors.push(`Cabeçalho esperado ${info.text} na coluna ${info.column}.`);
			continue;
		}
		const expectedNormalizedText = normalizeText(info.text);
		const cellNormalizedText = normalizeText(cellText);
		if (expectedNormalizedText !== cellNormalizedText) {
			errors.push(
				`Cabeçalho esperado ${info.text} na coluna ${info.column}. Encontrado ${cellText}.`,
			);
		}
	}
	return errors;
}

function decodeCol(column: string | number): number {
	if (typeof column === 'string') {
		return XLSX.utils.decode_col(column);
	}
	return column;
}
