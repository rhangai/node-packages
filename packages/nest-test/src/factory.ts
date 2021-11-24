import type { Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestManager, TestManagerPlugin } from '@rhangai/nest-test';

type TestManagerBuilder<TServices extends Record<string, Type<any>> = never> = {
	-readonly [K in keyof TestManager<TServices>]?: TestManager<TServices>[K];
};

export type TestManagerCreateOptions<TServices extends Record<string, Type<any>> = never> = {
	imports?: any[];

	services?: TServices | null;
	timeout?: number;
	plugins?: TestManagerPlugin[];
};

type CreateTestFactoryOptions = {
	imports?: any[];
	plugins?: TestManagerPlugin[];
};

type CreateTestFunction = <TServices extends Record<string, Type<any>> = never>(
	options: TestManagerCreateOptions<TServices>
) => TestManager<TServices>;

export function createTestFactory(factoryOptions: CreateTestFactoryOptions): CreateTestFunction {
	return <TServices extends Record<string, Type<any>>>(
		options: TestManagerCreateOptions<TServices> = {}
	) => {
		jest.setTimeout(options.timeout ?? 30000);

		const pluginSet = new Set<TestManagerPlugin>();
		const plugins = (options.plugins ?? []).filter(Boolean);
		const testManager: TestManagerBuilder<TServices> = {
			addPlugin(plugin) {
				if (!pluginSet.has(plugin)) {
					plugins.push(plugin);
					pluginSet.add(plugin);
				}
			},
		};
		if (factoryOptions.plugins) {
			factoryOptions.plugins.forEach((p) => testManager.addPlugin!(p));
		}
		beforeAll(async () => {
			try {
				const globalImports = factoryOptions.plugins ?? [];
				const imports = options.imports || [];
				let http = false;
				plugins.forEach((p) => {
					const config = p.config?.();
					if (!config) return;
					http ||= !!config.http;
					if (config.imports) imports.push(...config.imports);
				});

				const testModuleBuilder = Test.createTestingModule({
					imports: [...globalImports, ...imports].filter(Boolean),
					providers: [],
				});
				for (const plugin of plugins) {
					await plugin.build?.(testModuleBuilder);
				}
				const moduleRef = await testModuleBuilder.compile();
				if (http) {
					const app = moduleRef.createNestApplication();
					await app.init();
					testManager.httpServer = app.getHttpServer();
					testManager.app = app;
				} else {
					await moduleRef.init();
					testManager.app = moduleRef;
				}
				if (options.services) {
					const services: any = {};
					// eslint-disable-next-line guard-for-in
					for (const key in options.services as any) {
						services[key] = testManager.app.get<any>(options.services[key]);
					}
					testManager.services = services;
				}
				for (const plugin of plugins) {
					const extended = await plugin.setup?.(testManager.app);
					if (extended != null) {
						Object.assign(testManager, extended);
					}
				}
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
				process.exit(1);
			}
		});
		afterAll(async () => {
			await testManager.app!.close();
		});

		const t = testManager as TestManager<TServices>;
		// createEntityManagerPlugin(t);

		// let e2eLoaded = false;
		// let e2e: any = null;
		// t.e2e = (cb) => {
		// 	if (!e2eLoaded) {
		// 		e2eLoaded = true;
		// 		if (!+process.env.APP_TEST_SKIP_E2E!) {
		// 			// eslint-disable-next-line global-require
		// 			const { createTestE2E } = require('./plugins/e2e');
		// 			e2e = createTestE2E(t);
		// 		}
		// 	}
		// 	if (e2e) {
		// 		cb(e2e);
		// 	} else {
		// 		it.skip('e2e', () => {
		// 			// Não tem E2E
		// 		});
		// 	}
		// };

		return t;
	};
}
