import { writeFile } from 'fs';
import { resolve } from 'path';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
	GqlModuleOptions,
	GraphQLModule,
	GraphQLTypesLoader,
	GqlExceptionFilter,
} from '@nestjs/graphql';

export type GraphqlTypesGeneratorOptions = {
	baseDir: string;
	scripts: Record<string, GqlModuleOptions>;
};

/**
 * Types generator to help generate scripts
 */
export class GraphqlTypesGenerator {
	private app: INestApplicationContext | null;

	constructor(app?: INestApplicationContext) {
		this.app = app ?? null;
	}

	private async getApp() {
		if (!this.app) {
			this.app = await NestFactory.createApplicationContext(GraphQLModule.forRoot());
		}
		return this.app;
	}

	async close() {
		if (this.app) {
			const { app } = this;
			this.app = null;
			await app.close();
		}
	}

	async generate(options: GqlModuleOptions) {
		const app = await this.getApp();
		const typesLoader = app.get(GraphQLTypesLoader);
		return typesLoader.mergeTypesByPaths(options.typePaths!);
	}

	async write(filename: string, options: GqlModuleOptions) {
		const schema = await this.generate(options);
		await new Promise<void>((promiseResolve, reject) => {
			writeFile(filename, schema, (err) => {
				err ? reject(err) : promiseResolve();
			});
		});
	}

	static async main({ baseDir, scripts }: GraphqlTypesGeneratorOptions) {
		const generator = new GraphqlTypesGenerator();
		try {
			const scriptValues = Object.entries(scripts);
			for (const [filename, options] of scriptValues) {
				await generator.write(resolve(baseDir, filename), options);
			}
		} finally {
			await generator.close();
		}
	}
}
