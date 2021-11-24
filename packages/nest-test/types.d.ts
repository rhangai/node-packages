import type { INestApplicationContext, Type } from '@nestjs/common';
import type { TestingModuleBuilder } from '@nestjs/testing';

type TestManagerServices<TServices extends Record<string, Type<any>>> = {
	readonly [K in keyof TServices]: TServices[K] extends Type<infer U> ? U : any;
};

declare module '@rhangai/nest-test' {
	type TestManagerOptions = {
		http?: boolean;
		imports?: any[];
	};

	type TestManagerPlugin = {
		config?: () => TestManagerOptions;
		build?: (builder: TestingModuleBuilder) => void | Promise<void>;
		setup?: (
			app: INestApplicationContext
		) => TestManagerSetupParam<any> | Promise<TestManagerSetupParam<any>>;
	};

	interface TestManager<TServices extends Record<string, Type<any>> = never> {
		readonly app: INestApplicationContext;
		readonly httpServer: any;
		readonly services: TestManagerServices<TServices>;
		addPlugin(plugin: TestManagerPlugin): void;
	}

	type TestManagerSetupParam<TServices extends Record<string, Type<any>> = never> = {
		-readonly [K in keyof TestManager<TServices>]?: TestManager<TServices>[K];
	};
}
