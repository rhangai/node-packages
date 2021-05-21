import { join } from 'path';
import { applyDecorators, Controller, SetMetadata } from '@nestjs/common';

export function createControllerFactory<Value>(key: string | symbol) {
	return function controllerFactory(value: Value, prefix: string) {
		return function controllerDecorator(name: string) {
			return applyDecorators(
				// Controller
				Controller(join(prefix, name)),
				// Metadata
				SetMetadata(key, value)
			);
		};
	};
}
