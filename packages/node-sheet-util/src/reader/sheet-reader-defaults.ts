import { ISheetReaderLogger } from './core/sheet-reader-types';

const SHEET_READER_CONSOLE_LOGGER: ISheetReaderLogger = {
	error(err: any) {
		// eslint-disable-next-line no-console
		console.error(err);
	},
};

const SHEET_READER_DEFAULTS = {
	logger: null as ISheetReaderLogger | null,
};

export function sheetReaderSetDefaultLogger(logger: ISheetReaderLogger | null) {
	SHEET_READER_DEFAULTS.logger = logger;
}

export function sheetReaderGetDefaultLogger(): ISheetReaderLogger {
	return SHEET_READER_DEFAULTS.logger ?? SHEET_READER_CONSOLE_LOGGER;
}
