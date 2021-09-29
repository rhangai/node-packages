import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { ConfigFactory, ConfigModule } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DatabaseModule } from './database';

export type CreateCoreModuleOptions = {
	ormconfig: TypeOrmModuleOptions;
	imports?: ModuleMetadata['imports'];
	configFactory: ConfigFactory<Record<string, any>>;
};

/**
 * Create the core module
 * @param options
 * @returns
 */
export function createCoreModule(options: CreateCoreModuleOptions): DynamicModule {
	@Module({
		imports: [
			DatabaseModule.forRoot(options.ormconfig),
			ConfigModule.forRoot({
				isGlobal: true,
				load: [options.configFactory],
			}),
			...(options.imports ?? []),
		],
	})
	class CoreModule {}
	return {
		module: CoreModule,
	};
}
