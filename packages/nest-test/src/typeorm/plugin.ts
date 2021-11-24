/* eslint-disable import/no-extraneous-dependencies */
import type { TestManagerPlugin } from '@rhangai/nest-test/types';
import { EntityManager, QueryRunner, Connection } from 'typeorm';
import './types';

export function testCreateTypeormPlugin(): TestManagerPlugin {
	let queryRunner: QueryRunner;
	return {
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
		setup(t) {
			const entityManager = t.app.get<EntityManager>(EntityManager);
			return { entityManager };
		},
		afterEach: async () => {
			if (!queryRunner) return;
			if (+process.env.APP_TEST_COMMIT_TRANSACTION!) {
				await queryRunner.commitTransaction();
			} else {
				await queryRunner.rollbackTransaction();
			}
			await queryRunner.startTransaction();
		},
	};
}
