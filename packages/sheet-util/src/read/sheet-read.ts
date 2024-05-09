import XLSX from 'xlsx';
import { type Result, resultError } from '@rhangai/core';
import { type Column } from '../util/column';
import { normalizeText } from '../util/normalize-text';
import {
	sheetReadRaw,
	type SheetReadRawInputOptions,
	type SheetReadRawItem,
} from './sheet-read-raw';

type SheetReadColumnBase = number | Column;
type SheetReadColumn =
	| SheetReadColumnBase
	| {
			column: SheetReadColumnBase;
			text?: string;
	  };

export type SheetReadColumnsBase = Record<string, SheetReadColumn>;

type Data<Columns extends SheetReadColumnsBase> = Record<keyof Columns, string>;

export type SheetReadItem<Columns extends SheetReadColumnsBase> = SheetReadRawItem & {
	/**
	 * The data of the row read
	 */
	data: Data<Columns>;
	/**
	 * The header item
	 */
	header: Data<Columns>;
	/**
	 * The header raw data
	 */
	headerRawData: string[];
};

export type SheetReadOptions<Columns extends SheetReadColumnsBase> = SheetReadRawInputOptions & {
	/**
	 * Columns definitions to read
	 */
	columns: Columns;
	/**
	 * Validate the header texts
	 */
	headerValidate?:
		| boolean
		| ((this: void, header: Record<keyof Columns, string>) => string[] | null);
	/**
	 * Callback to be invoked on every row of the sheet
	 */
	callback(this: void, item: SheetReadItem<Columns>): void | Promise<void>;
};

type ColumnInfo<Columns extends SheetReadColumnsBase> = {
	index: number;
	column: string;
	key: keyof Columns;
	text: string;
};

/**
 * Read the sheet, row by row, using raw data
 */
export async function sheetRead<Columns extends SheetReadColumnsBase>(
	options: SheetReadOptions<Columns>,
): Promise<Result<void>> {
	type HeaderState = {
		header: Data<Columns>;
		headerRawData: string[];
		columns: Array<ColumnInfo<Columns>>;
	};
	let headerState: HeaderState | null = null;

	function headerParse(rawData: string[]): Result<void> {
		const columns: Array<ColumnInfo<Columns>> = [];
		for (const [columnKey, column] of Object.entries(options.columns)) {
			if (typeof column === 'object') {
				const index = decodeCol(column.column);
				columns.push({
					index,
					column: XLSX.utils.encode_col(index),
					key: columnKey,
					text: column.text ?? columnKey,
				});
			} else {
				const index = decodeCol(column);
				columns.push({
					index,
					column: XLSX.utils.encode_col(index),
					key: columnKey,
					text: columnKey,
				});
			}
		}
		const header = createFromRawData(columns, rawData);
		if (options.headerValidate !== false) {
			let errors: string[] | null;
			if (typeof options.headerValidate === 'function') {
				errors = options.headerValidate(header);
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

	let rowsRead = 0;
	const result = await sheetReadRaw({
		...options,
		callback(item) {
			if (!headerState) {
				const headerResult = headerParse(item.rawData);
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
	if (rowsRead <= 0) {
		return resultError(`Nenhum item foi processado. Planilha vazia`, `WORKSHEET_EMPTY`);
	}
	return { success: true };
}

/// Create the data
function createFromRawData<Columns extends SheetReadColumnsBase>(
	columns: Array<ColumnInfo<Columns>>,
	rawData: string[],
): Data<Columns> {
	const data: Partial<Data<Columns>> = {};
	for (const info of columns) {
		data[info.key] = rawData[info.index] ?? '';
	}
	return data as Data<Columns>;
}

function headerValidateDefault<Columns extends SheetReadColumnsBase>(
	columnsInfos: Array<ColumnInfo<Columns>>,
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
