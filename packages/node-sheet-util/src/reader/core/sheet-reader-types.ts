import { FileInputType } from '@rhangai/common';

export interface ISheetReaderLogger {
	error(err: any): any;
}

export type SheetReaderHeaderItem = {
	column?: null | string | number;
	name?: string;
	validateName?: boolean;
};
export type SheetReaderHeaderItemInput = null | number | string | SheetReaderHeaderItem;
export type SheetReaderHeaderMapBase = Record<string, SheetReaderHeaderItemInput>;

export type SheetReaderData<HeaderMap extends SheetReaderHeaderMapBase> = {
	[K in keyof HeaderMap]: string;
};

export type SheetReaderOptions<HeaderMap extends SheetReaderHeaderMapBase> = {
	name?: string;
	input: FileInputType;
	sheet?: number | string | null;
	header: HeaderMap;
	headerValidateNames?: boolean;
	logger?: ISheetReaderLogger | null | false;
	error?: (err: Error) => string | false;
};
