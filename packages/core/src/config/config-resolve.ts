import { configRegisterContext, ConfigRegisterContext } from './config-register-context';

export function configResolve<T>(factory: (context: ConfigRegisterContext) => T): T {
	return factory(configRegisterContext);
}
