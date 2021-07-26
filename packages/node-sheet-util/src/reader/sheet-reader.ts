import { fileInputDispatch } from '@rhangai/common';
import dayjs from 'dayjs';
import { Cell, Row, Workbook } from 'exceljs';
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
function sheetReaderCreateRowGetter<HeaderMap extends SheetReaderHeaderMapBase>(
	headerRow: Row,
	headerMapParam: HeaderMap,
	options: {
		validateNames?: boolean;
	}
) {
	const headerCells: Array<{ cell: Cell; text: string; normalizedText: string }> = [];
	headerRow.eachCell((c) => {
		const text = c.toString();
		headerCells.push({
			cell: c,
			text,
			normalizedText: normalizeText(text),
		});
	});

	type HeaderMapItem = {
		key: string;
		column: number;
	};
	const headerMap: HeaderMapItem[] = [];
	const errorList: string[] = [];

	// eslint-disable-next-line guard-for-in
	for (const key in headerMapParam) {
		const header = sheetReaderGetHeaderItem(headerMapParam[key]);
		const headerName = header.name ?? key;
		const normalizedName = normalizeText(headerName);

		let cellItem;
		if (header.column == null) {
			cellItem = headerCells.find((item) => item.normalizedText === normalizedName);
		} else {
			const c = headerRow.getCell(header.column);
			cellItem = headerCells.find((item) => item.cell === c);
		}
		if (!cellItem) {
			errorList.push(`Não foi possível localizar um cabeçalho para ${headerName}`);
			continue;
		}
		if (options.validateNames !== false && cellItem.normalizedText !== normalizedName) {
			errorList.push(`Cabeçalho esperado: ${headerName}. Cabeçalho: ${cellItem.text}`);
			continue;
		}

		headerMap.push({
			key,
			column: cellItem.cell.fullAddress.col,
		});
	}
	if (errorList.length > 0) {
		throw new SheetReaderException(`Cabeçalho inválido`, errorList);
	}

	return (row: Row) => {
		if (!row || !row.hasValues) return null;
		const rowValues: Record<string, string> = {};
		headerMap.forEach((item) => {
			const cell = row.findCell(item.column);
			rowValues[item.key] = formatCell(cell);
		});
		return rowValues as SheetReaderData<HeaderMap>;
	};
}

/**
 * Lê cada item de uma planilha
 * @param options
 */
export async function sheetReaderForEach<HeaderMap extends SheetReaderHeaderMapBase>(
	options: SheetReaderForEachOptions<HeaderMap>
) {
	const workbook = new Workbook();
	await fileInputDispatch(options.input, {
		buffer: (buffer) => workbook.xlsx.load(buffer),
		stream: (stream) => workbook.xlsx.read(stream),
		path: (filePath) => workbook.xlsx.readFile(filePath),
	});

	const worksheet = workbook.worksheets[0];
	if (!worksheet) throw new SheetReaderException(`Planilha inválida`);

	const headerRow = worksheet.getRow(1);
	const rowGetter = sheetReaderCreateRowGetter(headerRow, options.header, {
		validateNames: options.headerValidateNames,
	});

	const errorList: string[] = [];
	const maxRow = worksheet.rowCount;
	for (let i = 2; i <= maxRow; ++i) {
		const row = worksheet.getRow(i);
		const rowValues = rowGetter(row);
		if (rowValues == null) continue;
		try {
			// eslint-disable-next-line no-await-in-loop
			await options.callback({
				row: i,
				data: rowValues,
			});
		} catch (e) {
			const errorText = options.error?.(e) ?? '';
			if (errorText !== false)
				errorList.push([`Erro na linha ${i}`, errorText].filter(Boolean).join(': '));
		}
	}
	if (errorList.length > 0) {
		throw new SheetReaderException(`Erro ao processar planilha`, errorList);
	}
}

// Normalize a text to load
function normalizeText(key: string): string {
	return key
		.normalize('NFD')
		.replace(/[^a-zA-Z0-9]/g, '')
		.toLowerCase();
}

// Format a cell
function formatCell(cell: Cell | undefined) {
	if (cell == null) return '';
	const { value } = cell;
	if (value instanceof Date) return dayjs(value).format('YYYY-MM-DD');
	return cell.toString();
}
