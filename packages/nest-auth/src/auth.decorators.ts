import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { authExecutionContextGet, authExecutionContextGetData } from './auth-execution-context';

export function authCreateParamDecorator<TData, TAuthData>(
	getter: (data: TData, authdata: TAuthData) => unknown
) {
	return createParamDecorator((data: TData, executionContext: ExecutionContext) => {
		const authExecutionContext = authExecutionContextGet(executionContext);
		if (!authExecutionContext) throw new Error(`Invalid decorator. Unknown context.`);

		const authdata = authExecutionContextGetData(authExecutionContext);
		if (!authdata) throw new UnauthorizedException();
		return getter(data, authdata);
	});
}
