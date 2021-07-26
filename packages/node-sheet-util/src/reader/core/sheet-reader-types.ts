import { FileInputType } from '@rhangai/common';

export type SheetReaderHeaderItem = {
	column?: null | string | number;
	name?: string;
};
export type SheetReaderHeaderItemInput = null | number | string | SheetReaderHeaderItem;
export type SheetReaderHeaderMapBase = Record<string, SheetReaderHeaderItemInput>;

export type SheetReaderData<HeaderMap extends SheetReaderHeaderMapBase> = {
	[K in keyof HeaderMap]: string;
};

export type SheetReaderOptions<HeaderMap extends SheetReaderHeaderMapBase> = {
	input: FileInputType;
	header: HeaderMap;
	headerValidateNames?: boolean;
	error?: (err: Error) => string | false;
};
