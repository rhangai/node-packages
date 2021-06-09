import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { AuthExecutionContextService } from './auth-execution-context.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	constructor(private readonly authExecutionContextService: AuthExecutionContextService) {}

	async intercept(executionContext: ExecutionContext, next: CallHandler) {
		await this.authExecutionContextService.apply(executionContext);
		return next.handle();
	}
}
