import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { EntityServiceContext, EntityServiceTransactionContext } from './entity.context';

@Injectable()
export class EntityService {
	constructor(private readonly entityManagerInstance: EntityManager) {}

	/**
	 * Get the entity manager from the given context
	 * @param options
	 * @returns
	 */
	entityManager(options: EntityServiceContext | null | undefined): EntityManager {
		if (!options?.entityManager) return this.entityManagerInstance;
		return options.entityManager;
	}

	/**
	 * Ensure a transaction
	 * @param context The transaction context
	 * @param callback The callback to be run inside the transaction
	 * @returns
	 */
	async transaction<R, C extends EntityServiceContext = EntityServiceContext>(
		context: C | null,
		callback: (context: EntityServiceTransactionContext<C>) => R | Promise<R>
	): Promise<R> {
		const entityManager = this.entityManager(context);
		if (entityManager.queryRunner?.isTransactionActive) {
			return callback({ ...context, entityManager } as any);
		}
		return entityManager.transaction(async (transactionEntityManager) =>
			callback({ ...context, entityManager: transactionEntityManager } as any)
		);
	}
}
