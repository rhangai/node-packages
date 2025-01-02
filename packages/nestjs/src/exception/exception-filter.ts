import {
	type ArgumentsHost,
	BadRequestException,
	Catch,
	HttpException,
	Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { type IToHttpException } from '@rhangai/core';
import { inspect } from 'node:util';

/**
 * Basic extended exception filter
 */
@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
	private logger = new Logger('ExceptionHandler');

	/**
	 * Overrides the default
	 * @param exceptionParam
	 * @param host
	 * @returns
	 */
	catch(exceptionParam: unknown, host: ArgumentsHost) {
		this.logException(exceptionParam);
		let exception = exceptionParam;
		if (isHttpException(exception)) {
			const httpBody = exception.toHttp();
			exception = new BadRequestException(httpBody);
		}
		if (host.getType() === 'http') {
			super.catch(exception, host);
			return;
		}
		if (exception instanceof HttpException) {
			throw exception;
		} else {
			throw new BadRequestException();
		}
	}

	private logException(exception: unknown) {
		if (!exception) {
			this.logger.error('Error');
		} else {
			this.logger.error(inspect(exception));
		}
	}
}

/// Check if i
function isHttpException(x: unknown): x is IToHttpException {
	if (x && typeof x === 'object' && 'toHttp' in x && typeof x.toHttp === 'function') {
		return true;
	}
	return false;
}
