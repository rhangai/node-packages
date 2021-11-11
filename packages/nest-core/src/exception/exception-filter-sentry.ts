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
					scope.setContext('host', host as any);
					scope.setUser(user);
					options.scope?.(scope, exceptionParam, host);
					return scope;
				});
			}
			return super.catch(exceptionParam, host);
		}
	}

	return ExceptionFilterSentryClass;
}
