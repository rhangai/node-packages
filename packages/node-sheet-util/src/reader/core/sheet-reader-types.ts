import { FileInputType } from '@rhangai/common';

export interface ISheetReaderLogger {
	error(err: any): any;
}

export type SheetReaderHeaderItem = {
	column?: null | string | number;
	optional?: boolean;
	name?: string;
	validateName?: boolean;
};
export type SheetReaderHeaderItemInput = null | number | string | SheetReaderHeaderItem;
export type SheetReaderHeaderMapBase = Record<string, SheetReaderHeaderItemInput>;

export type SheetReaderData<HeaderMap extends SheetReaderHeaderMapBase> = {
	[K in keyof HeaderMap]: string;
};

export type SheetReaderValues<HeaderMap extends SheetReaderHeaderMapBase> = {
	[K in keyof HeaderMap]: string | Date | boolean | number;
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
