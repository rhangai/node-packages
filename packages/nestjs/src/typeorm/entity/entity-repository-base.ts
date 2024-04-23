import { EntityManager } from 'typeorm';

/**
 * Repository
 */
export abstract class EntityRepositoryBase {
	constructor(public readonly manager: EntityManager) {}
}
