import type { Readable } from 'node:stream';

/**
 * Convert a nodejs stream to a buffer
 */
export function streamToBuffer(stream: Readable): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		const buffers: Buffer[] = [];
		stream.on('data', (chunk: unknown) => {
			if (chunk == null) {
				return;
			} else if (Buffer.isBuffer(chunk)) {
				buffers.push(chunk);
			} else if (typeof chunk === 'string') {
				buffers.push(Buffer.from(chunk));
			} else {
				reject(
					new Error(
						`Invalid chunk. Expected Buffer or String. Passed ${typeof chunk} ${chunk.constructor.name}`,
					),
				);
			}
		});
		stream.on('error', (err) => {
			reject(err);
		});
		stream.on('end', () => {
			resolve(Buffer.concat(buffers));
		});
	});
}
