import { configRegisterContext, ConfigRegisterContext } from './config-register-context';
import { registerAs, ConfigFactory, ConfigFactoryKeyHost } from '@nestjs/config';

export function configRegister<T>(
	name: string,
	factory: (context: ConfigRegisterContext) => T
): ConfigFactory<T> & ConfigFactoryKeyHost {
	return registerAs(name, () => factory(configRegisterContext));
}
