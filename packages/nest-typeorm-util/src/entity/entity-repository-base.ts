import { EntityManager } from 'typeorm';

/**
 * Repository
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class EntityRepositoryBase<TEntity> {
	constructor(public readonly manager: EntityManager) {}
}
