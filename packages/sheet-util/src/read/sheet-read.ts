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

export type SheetReadItem<Columns extends SheetReadColumnsBase> = SheetReadRawItem & {
	/**
	 * The data of the row read
	 */
	data: Record<keyof Columns, string>;
};

export type SheetReadOptions<Columns extends SheetReadColumnsBase> = SheetReadRawInputOptions & {
	/**
	 * Columns definitions to read
	 */
	columns: Columns;
	/**
	 * Validate the header texts
	 */
	headerValidateText?: boolean;
	/**
	 * Callback to be invoked on every row of the sheet
	 */
	callback(this: void, item: SheetReadItem<Columns>): void | Promise<void>;
};

/**
 * Read the sheet, row by row, using raw data
 */
export async function sheetRead<Columns extends SheetReadColumnsBase>(
	options: SheetReadOptions<Columns>,
): Promise<Result<void>> {
	type ItemData = SheetReadItem<Columns>['data'];

	type ColumnInfo = {
		index: number;
		column: string;
		key: keyof ItemData;
		text: string;
	};

	let columnsInfos: ColumnInfo[] | null = null;

	function headerParse(rawData: string[]): Result<void> {
		columnsInfos = [];
		for (const [columnKey, column] of Object.entries(options.columns)) {
			if (typeof column === 'object') {
				const index = decodeCol(column.column);
				columnsInfos.push({
					index,
					column: XLSX.utils.encode_col(index),
					key: columnKey,
					text: column.text ?? columnKey,
				});
			} else {
				const index = decodeCol(column);
				columnsInfos.push({
					index,
					column: XLSX.utils.encode_col(index),
					key: columnKey,
					text: columnKey,
				});
			}
		}

		const errors: string[] = [];
		if (options.headerValidateText !== false) {
			for (const info of columnsInfos) {
				if (!rawData[info.index]) {
					errors.push(`Cabeçalho esperado ${info.text} na coluna ${info.column}`);
					continue;
				}
				const expectedNormalizedText = normalizeText(info.text);
				const cellText = rawData[info.index] ?? '';
				const cellNormalizedText = normalizeText(cellText);
				if (expectedNormalizedText !== cellNormalizedText) {
					errors.push(
						`Cabeçalho esperado ${info.text} na coluna ${info.column}. Encontrado ${cellText}`,
					);
				}
			}
		}
		if (errors.length > 0) {
			return resultError('Erro ao ler cabeçalho', 'WORKSHEET_READ_COLUMN', errors);
		}
		return { success: true };
	}

	let rowsRead = 0;
	const result = await sheetReadRaw({
		...options,
		callback(item) {
			if (!columnsInfos) {
				const headerResult = headerParse(item.rawData);
				if (!headerResult.success) {
					item.bail(headerResult);
				}
				return;
			}

			const data: Partial<ItemData> = {};
			for (const info of columnsInfos) {
				data[info.key] = item.rawData[info.index] ?? '';
			}
			rowsRead += 1;
			return options.callback({
				...item,
				data: data as ItemData,
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

function decodeCol(column: string | number): number {
	if (typeof column === 'string') {
		return XLSX.utils.decode_col(column);
	}
	return column;
}
