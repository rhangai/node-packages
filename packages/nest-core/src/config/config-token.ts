import { Inject } from '@nestjs/common';
import { getConfigToken } from '@nestjs/config';

export const CONFIG_DEFAULT_KEY = '@rhangai/nest-core';

export function InjectConfig() {
	return Inject(getConfigToken(CONFIG_DEFAULT_KEY));
}
