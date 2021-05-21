import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ToHttpException } from './http.exception';

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		if (isHttpException(exception)) {
			const httpBody = exception.toHttp();
			super.catch(new BadRequestException(httpBody), host);
		} else {
			super.catch(exception, host);
		}
	}
}

function isHttpException(x: any): x is ToHttpException {
	if ('toHttp' in x && typeof x.toHttp === 'function') return true;
	return false;
}
