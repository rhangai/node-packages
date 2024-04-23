import { type LogLevel, Logger as NestLogger } from '@nestjs/common';
import { unreachableIgnore } from '@rhangai/common';
import type { Logger } from 'typeorm';

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
			return (NestLogger as any).isLevelEnabled(level);
		} else if ('isLogLevelEnabled' in this.internalLogger) {
			return (this.internalLogger as any).isLogLevelEnabled(level);
		}
		return false;
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
