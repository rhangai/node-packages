import { registerAs, ConfigFactory, ConfigFactoryKeyHost } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { configRegisterContext, ConfigRegisterContext } from './config-register-context';

export function configRegister<T>(
	factory: (context: ConfigRegisterContext) => T
): [ConfigFactory<T> & ConfigFactoryKeyHost, () => ParameterDecorator] {
	const configFactory = registerAs('config', () => configResolve(factory));
	const InjectConfig = () => Inject(configFactory.KEY);
	return [configFactory, InjectConfig];
}

export function configResolve<T>(factory: (context: ConfigRegisterContext) => T): T {
	return factory(configRegisterContext);
}
