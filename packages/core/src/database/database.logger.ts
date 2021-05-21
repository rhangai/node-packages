import type { Logger } from 'typeorm';
import { LogLevel, Logger as NestLogger } from '@nestjs/common';

/**
 *
 */
export class DatabaseLogger implements Logger {
	constructor(private readonly internalLogger: NestLogger) {}

	logQuery(query: string, parameters?: any[] | undefined) {
		if (this.isLogEnabled('debug')) {
			const formattedQuery = this.formatQuery(query, parameters);
			this.internalLogger.debug(formattedQuery);
		}
	}

	logQueryError(error: string, query: string, parameters?: any[] | undefined) {
		const info = [this.formatQuery(query, parameters), this.formatError(error)].flat();
		this.internalLogger.error(`Erro rodando a query:\n${info.filter(Boolean).join('\n')}`);
	}

	logQuerySlow(time: number, query: string, parameters?: any[] | undefined) {
		const formattedQuery = this.formatQuery(query, parameters);
		this.internalLogger.warn(`${formattedQuery} - A query demorou ${time}ms`);
	}

	logSchemaBuild(message: string) {
		this.internalLogger.debug({ message });
	}

	logMigration(message: string) {
		this.internalLogger.debug({ message });
	}

	log(level: 'log' | 'info' | 'warn', message: any) {
		if (level === 'log') {
			this.internalLogger.log(message);
		} else if (level === 'info') {
			this.internalLogger.debug(message);
		} else if (level === 'warn') {
			this.internalLogger.warn(message);
		}
	}

	private isLogEnabled(level: LogLevel): boolean {
		// @ts-ignore
		return this.internalLogger.isLogLevelEnabled(level);
	}

	private formatQuery(query: string, parameters?: any) {
		if (parameters == null || (Array.isArray(parameters) && parameters.length <= 0)) {
			return query;
		}
		return `${query} -- ${JSON.stringify(parameters)}`;
	}

	private formatError(error: any): string[] | string | null {
		if (typeof error === 'string') {
			return error;
		} else if (error == null) {
			return null;
		}

		const errors: string[] = [];
		if (error.message) {
			errors.push(`Error: ${error.message}`);
		}
		if (error.hint) {
			errors.push(`  ${error.hint}`);
		}
		return errors;
	}
}
