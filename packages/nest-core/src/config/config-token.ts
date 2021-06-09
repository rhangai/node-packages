import { getConfigToken } from '@nestjs/config';
import { Inject } from '@nestjs/common';

export const CONFIG_DEFAULT_KEY = '@rhangai/nest-core';

export function InjectConfig() {
	return Inject(getConfigToken(CONFIG_DEFAULT_KEY));
}
