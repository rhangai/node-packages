import { inspect } from 'util';
import { Catch, ArgumentsHost, Optional, Type } from '@nestjs/common';
import { InjectConfig } from '../config';
import { ExceptionFilter } from './exception-filter';

type CreateExceptionFilterSentryOptions = {
	user?: (exceptionParam: unknown, host: ArgumentsHost) => any;
	scope?: (scope: any, exceptionParam: unknown, host: ArgumentsHost) => void;
};

/**
 * Create a sentry exception filter
 * @param Sentry
 * @param options
 * @returns
 */
export function createExceptionFilterSentry(
	Sentry: any,
	options: CreateExceptionFilterSentryOptions
): Type<ExceptionFilter> {
	@Catch()
	class ExceptionFilterSentryClass extends ExceptionFilter {
		private readonly isSentryEnabled: boolean = false;

		constructor(@Optional() @InjectConfig() config: any) {
			super(config);
			if (config && config.sentry && config.sentry.enabled !== false) {
				this.isSentryEnabled = true;
				Sentry.init({
					environment: config.debug ? 'development' : 'production',
					dsn: config.sentry.dns,
				});
			}
		}

		catch(exceptionParam: unknown, host: ArgumentsHost) {
			if (this.isSentryEnabled) {
				const user = options.user?.(exceptionParam, host) ?? null;
				Sentry.captureException(exceptionParam, (scope: any) => {
					scope.setUser(user);
					const type = host.getType<string>();
					scope.setContext('host', { hostType: type });
					if (type === 'http') {
						const http = host.switchToHttp();
						scope.setContext('http:request', prettyRequest(http.getRequest()));
					} else if (type === 'graphql') {
						scope.setContext('graphql', {
							root: host.getArgByIndex(0),
							args: host.getArgByIndex(1),
						});
						scope.setContext('graphql:context', host.getArgByIndex(2));
						scope.setContext('graphql:info', host.getArgByIndex(3));
					} else {
						scope.setContext('host:info', {
							args: host.getArgs(),
						});
					}
					options.scope?.(scope, exceptionParam, host);
				});
			}
			return super.catch(exceptionParam, host);
		}
	}

	return ExceptionFilterSentryClass;
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
