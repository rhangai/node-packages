import { registerAs, ConfigFactory, ConfigFactoryKeyHost } from '@nestjs/config';
import { ConfigRegisterContext } from './config-register-context';
import { configResolve } from './config-resolve';
import { CONFIG_DEFAULT_KEY } from './config-token';

export function configRegister<T>(
	factory: (context: ConfigRegisterContext) => T
): ConfigFactory<T> & ConfigFactoryKeyHost {
	return registerAs(CONFIG_DEFAULT_KEY, () => configResolve(factory));
}
