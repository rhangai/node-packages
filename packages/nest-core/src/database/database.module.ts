import { DynamicModule, Logger, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseLogger } from './database.logger';
import { EntityModule } from './entity';

@Module({
	imports: [EntityModule],
})
export class DatabaseModule {
	static forRoot(options: TypeOrmModuleOptions): DynamicModule {
		return {
			module: DatabaseModule,
			imports: [
				TypeOrmModule.forRoot({
					logger: new DatabaseLogger(new Logger('database')),
					...options,
				}),
			],
		};
	}
}
