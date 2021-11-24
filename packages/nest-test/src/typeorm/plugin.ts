/* eslint-disable import/no-extraneous-dependencies */
import { TestManager } from '@rhangai/nest-test';
import { EntityManager, QueryRunner, Connection } from 'typeorm';
import './types';

export function testCreateTypeormPlugin() {
	return (t: TestManager<any>) => {
		let queryRunner: QueryRunner;
		t.addPlugin({
			build(testModuleBuilder) {
				testModuleBuilder.overrideProvider(EntityManager).useFactory({
					inject: [Connection],
					async factory(connection: Connection) {
						queryRunner = connection.createQueryRunner();
						await queryRunner.startTransaction();
						return queryRunner.manager;
					},
				});
			},
			setup(app) {
				const entityManager = app.get<EntityManager>(EntityManager);
				return { entityManager };
			},
		});
		afterEach(async () => {
			if (!queryRunner) return;
			if (+process.env.APP_TEST_COMMIT_TRANSACTION!) {
				await queryRunner.commitTransaction();
			} else {
				await queryRunner.rollbackTransaction();
			}
			await queryRunner.startTransaction();
		});
	};
}
