import { inspect } from 'util';
import { Catch, ArgumentsHost, Optional, Type } from '@nestjs/common';
import { InjectConfig } from '../config';
import { ExceptionFilter } from './exception-filter';

type SentryConfig = {
	enabled?: boolean;
	dsn?: string;
};

type CreateExceptionFilterSentryOptions = {
	config?: SentryConfig;
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

		private readonly sentryConfig: SentryConfig;

		constructor(@Optional() @InjectConfig() config: any) {
			super(config);
			this.sentryConfig = {
				...(config?.sentry ?? {}),
				...options.config,
			};
			if (this.sentryConfig.dsn && this.sentryConfig.enabled !== false) {
				this.isSentryEnabled = true;
				Sentry.init({
					environment: config?.debug ? 'development' : 'production',
					dsn: this.sentryConfig.dsn,
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
						const info = host.getArgByIndex(3);
						scope.setContext('graphql', {
							fieldName: info?.fieldName,
							returnType: info?.returnType,
							args: inspect(host.getArgByIndex(1)),
						});
					} else {
						const args = host.getArgs();
						args.forEach((v, i) => {
							scope.setContext(`host:arg${i + 1}`, v);
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
