import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { authExecutionContextGetData } from './auth-execution-context';

export function authCreateParamDecorator<TData, TAuthData>(
	getter: (data: TData, authdata: TAuthData) => unknown
) {
	return createParamDecorator((data: TData, executionContext: ExecutionContext) => {
		const authdata = authExecutionContextGetData<TAuthData>(executionContext);
		if (!authdata) throw new Error(`Invalid decorator. Unknown context.`);
		if (!authdata.data) throw new UnauthorizedException();
		return getter(data, authdata.data);
	});
}
