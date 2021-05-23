import { join } from 'path';
import { applyDecorators, Controller, SetMetadata } from '@nestjs/common';

export type ControllerDecoratorFunction = {
	(path: string): ClassDecorator;
	url(path: string): string;
};

export function createControllerFactory<Value>(key: string | symbol) {
	return function controllerFactory(value: Value, prefix: string): ControllerDecoratorFunction {
		function controllerUrl(path: string) {
			return join(prefix, path);
		}
		function controllerDecorator(path: string) {
			return applyDecorators(
				// Controller
				Controller(controllerUrl(path)),
				// Metadata
				SetMetadata(key, value)
			);
		}
		controllerDecorator.url = controllerUrl;
		return controllerDecorator;
	};
}
