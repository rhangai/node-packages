import { inspect } from 'util';
import { ArgumentsHost } from '@nestjs/common';

/**
 * Get an exception filter context from an ArgumentsHost
 * @param host
 * @returns
 */
export function exceptionFilterContext(host: ArgumentsHost): Record<string, unknown> {
	const exceptionContext: Record<string, unknown> = {};
	const type = host.getType<string>();
	exceptionContext.host = { hostType: type };
	if (type === 'http') {
		const http = host.switchToHttp();
		exceptionContext['http:request'] = prettyRequest(http.getRequest());
	} else if (type === 'graphql') {
		const info = host.getArgByIndex(3);
		exceptionContext.graphql = {
			fieldName: info?.fieldName,
			returnType: info?.returnType,
			args: inspect(host.getArgByIndex(1)),
		};
	} else {
		const args = host.getArgs();
		args.forEach((v, i) => {
			exceptionContext[`host:arg${i + 1}`] = v;
		});
	}
	return exceptionContext;
}

function prettyRequest(request: any) {
	if (request == null) return null;
	return {
		url: request.url,
		params: inspect(request.params),
		query: inspect(request.query),
		headers: inspect(request.rawHeaders),
		body: inspect(request.body),
		file: inspect(request.file),
		files: inspect(request.files),
	};
}
