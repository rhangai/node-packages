import { type Readable } from 'node:stream';

interface SheetReadInputBuffer {
	buffer: Buffer;
}
interface SheetReadInputStream {
	stream: Readable;
}
interface SheetReadInputFilename {
	filename: string;
}
export type SheetReadInput = SheetReadInputBuffer | SheetReadInputStream | SheetReadInputFilename;
