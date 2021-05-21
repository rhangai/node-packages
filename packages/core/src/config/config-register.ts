import { configRegisterContext, ConfigRegisterContext } from './config-register-context';
import { registerAs, ConfigFactory, ConfigFactoryKeyHost, ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';

export function configRegister<T>(
	factory: (context: ConfigRegisterContext) => T
): [ConfigFactory<T> & ConfigFactoryKeyHost, () => PropertyDecorator] {
	const configFactory = registerAs('config', () => factory(configRegisterContext));
	const InjectConfig = () => Inject(configFactory.KEY);
	return [configFactory, InjectConfig];
}
