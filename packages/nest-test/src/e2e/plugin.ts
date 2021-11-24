/* eslint-disable import/no-unresolved, import/no-extraneous-dependencies */
import type { TestManager } from '@rhangai/nest-test';
import request from 'supertest';

type TestManagerE2EGraphqlOptions = {
	query: (gql: typeof String.raw) => string;
	variables?: Record<string, unknown>;
	expect?: unknown;
	setup?: (req: request.Test) => request.Test;
};

export type TestManagerE2E = {
	request: () => ReturnType<typeof request>;
	graphql: (
		options: TestManagerE2EGraphqlOptions
	) => Promise<{ data: any; response: request.Response }>;
};

export function testCreateE2EPlugin() {
	return (t: TestManager<any>) => {
		const createE2E = (): TestManagerE2E => ({
			request() {
				return request(t.httpServer);
			},
			async graphql(options: TestManagerE2EGraphqlOptions) {
				let req: request.Test = request(t.httpServer)
					.post('/api/admin/graphql')
					.set({ 'x-auth-userinfo': 'dev' })
					.send({ query: options.query(String.raw), variables: options.variables });
				if (options.setup) {
					req = options.setup(req);
				}
				const response = await req;
				expect(response).toMatchObject({
					status: 200,
					body: {
						data: options.expect ?? expect.anything(),
					},
				});
				expect(response.body).not.toHaveProperty('errors');
				return { data: response.body?.data, response };
			},
		});
		t.addPlugin({
			config: () => ({ http: true }),
			setup() {
				let e2eLoaded = false;
				let e2eInstance: any = null;
				const e2e = (cb: any) => {
					if (!e2eLoaded) {
						e2eLoaded = true;
						if (!+process.env.APP_TEST_SKIP_E2E!) {
							e2eInstance = createE2E();
						}
					}
					if (e2eInstance) {
						cb(e2eInstance);
					} else {
						it.skip('e2e', () => {
							// Does not run e2e tests
						});
					}
				};
				return { e2e };
			},
		});
	};
}
