import { ExecutionContext, CanActivate } from '@nestjs/common';
import {
	AuthExecutionContext,
	authExecutionContextGet,
	authExecutionContextSetStorageData,
} from './auth-execution-context';

export abstract class AuthGuard<T> implements CanActivate {
	abstract authenticate(authExecutionContext: AuthExecutionContext): Promise<T>;

	async canActivate(executionContext: ExecutionContext): Promise<boolean> {
		const authExecutionContext = authExecutionContextGet(executionContext);
		if (authExecutionContext) {
			const authdata = await this.authenticate(authExecutionContext);
			authExecutionContextSetStorageData(authExecutionContext, authdata);
		}
		return true;
	}
}
