import { type LogLevel, Logger as NestLogger } from '@nestjs/common';
import { type Logger } from 'typeorm';
import { unreachableIgnore } from '@rhangai/core';

/**
 *
 */
export class DatabaseLogger implements Logger {
	private readonly internalLogger: NestLogger;

	constructor(logger: NestLogger | string) {
		if (typeof logger === 'string') {
			this.internalLogger = new NestLogger(logger);
		} else {
			this.internalLogger = logger;
		}
	}

	logQuery(query: string, parameters?: unknown[]) {
		if (this.isLogEnabled('debug')) {
			const formattedQuery = this.formatQuery(query, parameters);
			this.internalLogger.debug(formattedQuery);
		}
	}

	logQueryError(error: string, query: string, parameters?: unknown[]) {
		const info = [this.formatQuery(query, parameters), this.formatError(error)].flat();
		this.internalLogger.error(`Erro rodando a query:\n${info.filter(Boolean).join('\n')}`);
	}

	logQuerySlow(time: number, query: string, parameters?: unknown[]) {
		const formattedQuery = this.formatQuery(query, parameters);
		this.internalLogger.warn(`${formattedQuery} - A query demorou ${time}ms`);
	}

	logSchemaBuild(message: string) {
		this.internalLogger.debug({ message });
	}

	logMigration(message: string) {
		this.internalLogger.debug({ message });
	}

	log(level: 'log' | 'info' | 'warn', message: unknown) {
		switch (level) {
			case 'log': {
				this.internalLogger.log(message);
				break;
			}
			case 'info': {
				this.internalLogger.log(message);
				break;
			}
			case 'warn': {
				this.internalLogger.log(message);
				break;
			}
			default: {
				unreachableIgnore(level);
			}
		}
	}

	private isLogEnabled(level: LogLevel): boolean {
		if ('isLevelEnabled' in NestLogger) {
			return NestLogger.isLevelEnabled(level);
		} else if ('isLogLevelEnabled' in this.internalLogger) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
			return (this.internalLogger as any).isLogLevelEnabled(level);
		}
		return false;
	}

	private formatQuery(query: string, parameters?: unknown) {
		if (parameters == null || (Array.isArray(parameters) && parameters.length <= 0)) {
			return query;
		}
		return `${query} -- ${JSON.stringify(parameters)}`;
	}

	private formatError(error: unknown): string[] | string | null {
		if (typeof error === 'string') {
			return error;
		} else if (error == null || typeof error !== 'object') {
			return null;
		}

		const errors: string[] = [];
		if ('message' in error && error.message) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
			errors.push(`Error: ${error.message}`);
		}
		if ('hint' in error && error.hint) {
			// eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
			errors.push(`  ${error.hint}`);
		}
		return errors;
	}
}
