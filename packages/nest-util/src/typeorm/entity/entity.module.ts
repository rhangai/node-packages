import { Global, Module } from '@nestjs/common';
import { EntityService } from './entity.service';

/**
 * Global module providing a entity
 */
@Global()
@Module({
	providers: [EntityService],
	exports: [EntityService],
})
export class EntityModule {}
