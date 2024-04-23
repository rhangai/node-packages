import type { Readable } from 'node:stream';

export type FileInputType = { buffer?: Buffer } | { stream?: Readable } | { path?: string };
export type FileInputDispatcher<T> = {
	buffer(buffer: Buffer): T | Promise<T>;
	stream(stream: Readable): T | Promise<T>;
	path(filePath: string): T | Promise<T>;
};

/**
 * Dispatch the file according to its type
 */
export function fileInputDispatch<T = void>(
	input: FileInputType,
	dispatcher: FileInputDispatcher<T>,
): T | Promise<T> {
	if ('buffer' in input && input.buffer) {
		return dispatcher.buffer(input.buffer);
	} else if ('stream' in input && input.stream) {
		return dispatcher.stream(input.stream);
	} else if ('path' in input && input.path) {
		return dispatcher.path(input.path);
	}
	throw new Error(`Arquivo inválido`);
}
