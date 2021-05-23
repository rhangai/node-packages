import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ToHttpException } from './http.exception';

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
	catch(exceptionParam: unknown, host: ArgumentsHost) {
		let exception = exceptionParam;
		if (isHttpException(exception)) {
			const httpBody = exception.toHttp();
			exception = new BadRequestException(httpBody);
		}
		if (host.getType() === 'http') {
			super.catch(exception, host);
		} else {
			throw exception;
		}
	}
}

function isHttpException(x: any): x is ToHttpException {
	if ('toHttp' in x && typeof x.toHttp === 'function') return true;
	return false;
}
