import { EntityManager } from 'typeorm';

export type EntityServiceContext = {
	entityManager: EntityManager | null;
};

// prettier-ignore
export type EntityServiceTransactionContext<C extends EntityServiceContext = EntityServiceContext> = Omit<C, 'entityManager'> & {
	entityManager: EntityManager;
};
