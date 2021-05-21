import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
	constructor(private readonly authService: AuthService) {}

	async intercept(executionContext: ExecutionContext, next: CallHandler) {
		await this.authService.applyExecutionContext(executionContext);
		return next.handle();
	}
}
