import { Injectable, ExecutionContext, CanActivate } from '@nestjs/common';
import { AuthExecutionContextService } from './auth-execution-context.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly authExecutionContextService: AuthExecutionContextService) {}

	async canActivate(executionContext: ExecutionContext): Promise<boolean> {
		await this.authExecutionContextService.apply(executionContext);
		return true;
	}
}
