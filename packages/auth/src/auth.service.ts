import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { authExecutionContextGet, authExecutionContextSetData } from './auth-execution-context';
import { IAuthenticator, AUTHENTICATOR_KEY } from './authenticator.interface';

@Injectable()
export class AuthService {
	constructor(
		@Inject(AUTHENTICATOR_KEY)
		private readonly authenticator: IAuthenticator<unknown>
	) {}

	async applyExecutionContext(executionContext: ExecutionContext) {
		const authExecutionContext = authExecutionContextGet(executionContext);
		if (authExecutionContext) {
			const authdata = await this.authenticator.authenticate(authExecutionContext);
			authExecutionContextSetData(authExecutionContext, authdata);
		}
	}
}
