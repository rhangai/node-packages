import XLSX, { type CellObject, type ParsingOptions, type WorkBook, type WorkSheet } from 'xlsx';
import { type SheetReadInput } from '../input';
import { type SheetResult, type SheetResultError } from '../result';
import { cellParse } from '../util/cell-parse';
import { streamToBuffer } from '../util/stream-to-buffer';
import { SheetReadError, SheetReadErrorBail, SheetReadErrorCode } from './sheet-read-error';

export interface SheetReadRawInputOptions {
	/**
	 * The input to read
	 */
	input: SheetReadInput;
	/**
	 * The sheet to read
	 */
	sheet?: number | string | null;
	/**
	 * Bail on the first error
	 */
	bailOnError?: boolean;
}

export interface SheetReadRawOptions extends SheetReadRawInputOptions {
	/**
	 * Callback to be invoked on every row of the sheet
	 */
	callback: (item: SheetReadRawItem) => void | Promise<void>;
}

export interface SheetReadRawItem {
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
	bail: (err?: string | null, bailError?: unknown) => never;
	/**
	 * Add a new error to the list of errors
	 */
	addError: (err: string) => void;
}

/**
 * Read the sheet, row by row, using raw data
 */
export async function sheetReadRaw(options: SheetReadRawOptions): Promise<SheetResult<null>> {
	let worksheet: WorkSheet;
	try {
		const workbook = await readWorkbook(options.input, {
			cellNF: true,
			cellDates: true,
		});
		const sheet = getSheet(workbook, options.sheet ?? null);
		if (!sheet) {
			return errorFromCode(SheetReadErrorCode.WORKSHEET_INVALID);
		}
		worksheet = sheet;
	} catch (err: unknown) {
		return errorFromCode(SheetReadErrorCode.WORKSHEET_INVALID, err);
	}

	const rangeRef = worksheet['!ref'];
	if (!rangeRef) {
		return errorFromCode(SheetReadErrorCode.WORKSHEET_INVALID);
	}
	const range = XLSX.utils.decode_range(rangeRef);
	const cb = options.callback;

	// Read the columns
	const columns: string[] = new Array<string>(range.e.c + 1);
	for (let c = 0; c <= range.e.c; ++c) {
		columns[c] = XLSX.utils.encode_col(c);
	}
	if (columns.length <= 0) {
		return errorFromCode(SheetReadErrorCode.WORKSHEET_INVALID);
	}

	//
	let r = 0;
	interface State {
		hasErrors: boolean;
		running: boolean;
		errors: string[];
		errorValues: Error[];
		bailError?: unknown;
	}
	const state: State = {
		hasErrors: false,
		running: true,
		errors: [],
		errorValues: [],
	};
	const bail = (error: string | null | undefined, bailError: unknown) => {
		if (error) {
			state.errors.unshift(error);
			state.hasErrors = true;
		}
		if (bailError != null) {
			state.hasErrors = true;
			state.bailError = bailError;
		}
		state.running = false;
		throw new SheetReadErrorBail();
	};
	const addError = (error: unknown) => {
		if (error instanceof SheetReadErrorBail) {
			return;
		}
		if (error instanceof Error) {
			state.errorValues.push(error);
		} else if (typeof error === 'string') {
			state.errors.push(`Erro na linha ${r + 1}: ${error}`);
		}
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
		const { bailError } = state;
		if (bailError) {
			if (bailError instanceof SheetReadError) {
				const error = bailError.cloneMerge(state.errors);
				return {
					success: false,
					error,
				};
			}
			return {
				success: false,
				error: bailError,
			};
		}

		let cause: Error | undefined;
		if (state.errorValues.length > 0) {
			if (state.errorValues.length === 1) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				cause = state.errorValues[0]!;
			} else {
				cause = new AggregateError(state.errorValues);
			}
		}
		return {
			success: false,
			error: new SheetReadError(
				SheetReadErrorCode.WORKSHEET_INVALID,
				'Erro na planilha',
				state.errors,
				cause,
			),
		};
	}
	return {
		success: true,
		data: null,
	};
}

/**
 * Lê um workbook
 */
async function readWorkbook(input: SheetReadInput, options: ParsingOptions): Promise<WorkBook> {
	if ('buffer' in input) {
		return XLSX.read(input.buffer, options);
	} else if ('stream' in input) {
		const buffer = await streamToBuffer(input.stream);
		return XLSX.read(buffer, options);
	} else if ('filename' in input) {
		return XLSX.readFile(input.filename, options);
	}
	throw new Error(`Arquivo inválido`);
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

// Result from code
function errorFromCode(errorCode: SheetReadErrorCode, cause?: unknown): SheetResultError {
	return {
		success: false,
		error: new SheetReadError(errorCode, '', undefined, cause),
	};
}
