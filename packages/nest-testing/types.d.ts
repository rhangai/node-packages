declare module '@rhangai/nest-testing/types' {
	import type { INestApplicationContext, Type } from '@nestjs/common';
	import type { TestingModuleBuilder } from '@nestjs/testing';

	type TestManagerServices<TServices extends Record<string, Type<any>>> = {
		readonly [K in keyof TServices]: TServices[K] extends Type<infer U> ? U : any;
	};

	type TestManagerOptions = {
		http?: boolean;
		imports?: any[];
	};

	type TestManagerPlugin = {
		config?: () => TestManagerOptions;
		build?: (builder: TestingModuleBuilder) => void | Promise<void>;
		global?: (t: TestManager<any>) => TestManagerSetupParam<any>;
		setup?: (
			t: TestManager<any>
		) => TestManagerSetupParam<any> | Promise<TestManagerSetupParam<any>>;
		afterEach?: () => void | Promise<void>;
		afterAll?: () => void | Promise<void>;
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
