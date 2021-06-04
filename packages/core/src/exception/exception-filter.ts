import { Catch, ArgumentsHost, BadRequestException, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { InjectConfig } from 'src/config';
import { ToHttpException } from './http.exception';

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
	private logger = new Logger('ExceptionHandler');

	constructor(@InjectConfig() private readonly config: any) {
		super();
	}

	catch(exceptionParam: unknown, host: ArgumentsHost) {
		let exception = exceptionParam;
		if (isHttpException(exception)) {
			const httpBody = exception.toHttp();
			exception = new BadRequestException(httpBody);
		}
		if (host.getType() === 'http') {
			super.catch(exception, host);
			return;
		}

		this.logException(exception);
		if (this.config.debug || exception instanceof HttpException) {
			throw exception;
		} else {
			throw new BadRequestException();
		}
	}

	private logException(exception: unknown) {
		if (!exception) {
			this.logger.error('Error');
		} else if (this.isExceptionObject(exception)) {
			this.logger.error(exception.message, exception.stack);
		} else {
			this.logger.error(exception);
		}
	}
}

function isHttpException(x: any): x is ToHttpException {
	if ('toHttp' in x && typeof x.toHttp === 'function') return true;
	return false;
}
