import XLSX, { type CellObject, type ParsingOptions, type WorkBook, type WorkSheet } from 'xlsx';
import {
	errorPublicMessageWithPrefix,
	type Result,
	resultError,
	type ResultError,
	resultErrorMerge,
} from '@rhangai/core';
import { fileInputDispatch, type FileInputType, streamToBuffer } from '@rhangai/core/node';
import { cellParse } from '../util/cell-parse';

export type SheetReadRawInputOptions = Omit<SheetReadRawOptions, 'callback'>;

export type SheetReadRawOptions = {
	/**
	 * The input to read
	 */
	input: FileInputType;
	/**
	 * The sheet to read
	 */
	sheet?: number | string | null;
	/**
	 * Bail on the first error
	 */
	bailOnError?: boolean;
	/**
	 * Callback to be invoked on every row of the sheet
	 */
	callback(this: void, item: SheetReadRawItem): void | Promise<void>;
};

export type SheetReadRawItem = {
	/**
	 * The index of the row being read
	 */
	rowIndex: number;
	/**
	 * Read the data
	 */
	rawData: string[];
	/**
	 * Read the values
	 */
	rawValues: unknown[];
	/**
	 * Bail on the data, aborting the operation
	 */
	bail(this: void, err: ResultError | string[] | string | null): void;
	/**
	 * Add a new error to the list of errors
	 */
	addError(this: void, err: string): void;
};

/**
 * Read the sheet, row by row, using raw data
 */
export async function sheetReadRaw(options: SheetReadRawOptions): Promise<Result<void>> {
	const workbookOptions: ParsingOptions = {
		cellNF: true,
		cellDates: true,
	};
	let worksheet: WorkSheet;
	try {
		const workbook = await fileInputDispatch(options.input, {
			buffer: (buffer) => XLSX.read(buffer, workbookOptions),
			stream: async (stream) => {
				const buffer = await streamToBuffer(stream);
				return XLSX.read(buffer, workbookOptions);
			},
			path: (filePath) => XLSX.readFile(filePath, workbookOptions),
		});
		const sheet = getSheet(workbook, options.sheet ?? null);
		if (!sheet) {
			return resultError(null, 'WORKSHEET_INVALID');
		}
		worksheet = sheet;
	} catch (_err: unknown) {
		return resultError(null, 'WORKSHEET_INVALID');
	}

	const rangeRef = worksheet['!ref'];
	if (!rangeRef) {
		return resultError(null, 'WORKSHEET_INVALID');
	}
	const range = XLSX.utils.decode_range(rangeRef);
	const cb = options.callback;

	// Read the columns
	const columns: string[] = new Array<string>(range.e.c + 1);
	for (let c = 0; c <= range.e.c; ++c) {
		columns[c] = XLSX.utils.encode_col(c);
	}
	if (columns.length <= 0) {
		return resultError(null, 'WORKSHEET_INVALID');
	}

	//
	let r = 0;
	const state = {
		hasErrors: false,
		running: true,
		error: null as ResultError | null,
		errors: [] as Array<string | undefined>,
	};
	const bail = (error: ResultError | string[] | string | null) => {
		if (error != null) {
			if (typeof error === 'object' && 'success' in error) {
				state.error = error;
			} else if (Array.isArray(error)) {
				for (const err of error) {
					if (typeof err === 'string') {
						state.errors.unshift(err);
					}
				}
			} else if (typeof error === 'string') {
				state.errors.unshift(error);
			}
			state.hasErrors = true;
		}
		state.running = false;
	};
	const addError = (error: unknown) => {
		state.errors.push(errorPublicMessageWithPrefix(error, `Erro na linha ${r + 1}`));
		state.hasErrors = true;
		if (options.bailOnError) {
			state.running = false;
		}
	};

	// For every row, iterates
	for (; r <= range.e.r; ++r) {
		let hasValue = false;
		const rawData: string[] = [];
		const rawValues: unknown[] = [];
		for (let c = 0; c <= range.e.c; ++c) {
			const cell = worksheet[`${columns[c]}${r + 1}`] as CellObject | undefined;
			const parsed = cellParse(cell);
			rawData.push(parsed.text);
			rawValues.push(parsed.value);
			if (parsed.text !== '') {
				hasValue = true;
			}
		}
		if (!hasValue) {
			continue;
		}

		try {
			await cb({
				rowIndex: r + 1,
				rawData,
				rawValues,
				bail,
				addError,
			});
		} catch (err: unknown) {
			addError(err);
		}

		if (!state.running) {
			break;
		}
	}
	if (state.hasErrors) {
		const sheetError = resultError('Erro na planilha', 'WORKSHEET_ERROR', state.errors);
		return resultErrorMerge(state.error, sheetError);
	}
	return { success: true };
}

/// Get the main sheet
function getSheet(workbook: WorkBook, sheet: string | number | null): WorkSheet | null {
	if (sheet == null) {
		const sheetName = workbook.SheetNames[0];
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const worksheet = workbook.Sheets[sheetName!];
		return worksheet ?? null;
	} else if (typeof sheet === 'string') {
		return workbook.Sheets[sheet] ?? null;
	} else if (typeof sheet === 'number') {
		const sheetName = workbook.SheetNames[sheet];
		if (!sheetName) {
			return null;
		}
		return workbook.Sheets[sheetName] ?? null;
	}
	return null;
}
