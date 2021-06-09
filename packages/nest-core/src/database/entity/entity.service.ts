import { Injectable, Type } from '@nestjs/common';
import { EntityManager, FindOneOptions } from 'typeorm';

type EntityServiceContext = {
	entityManager: EntityManager | null;
};

type EntityServiceTransactionContext<C extends EntityServiceContext> = Omit<C, 'entityManager'> & {
	entityManager: EntityManager;
};

type EntityServiceEntityOptions<Entity> = FindOneOptions<Entity> & {
	value: Entity | number;
	context: EntityServiceContext | null;
};

@Injectable()
export class EntityService {
	constructor(private readonly entityManagerInstance: EntityManager) {}

	entityManager(options: EntityServiceContext | null | undefined): EntityManager {
		if (!options?.entityManager) return this.entityManagerInstance;
		return options.entityManager;
	}

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

	async entity<Entity>(
		entityClass: Type<Entity>,
		options: EntityServiceEntityOptions<Entity>
	): Promise<Entity> {
		const { value, context, ...findOneOptions } = options;
		if (typeof value === 'object') {
			return value;
		}
		const entityManager = this.entityManager(context);
		return entityManager.findOneOrFail(entityClass, value as any, findOneOptions);
	}
}
