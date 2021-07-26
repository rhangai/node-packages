import { Inject } from '@nestjs/common';
import { getConfigToken } from '@nestjs/config';

export const CONFIG_DEFAULT_KEY = '@rhangai/nest-core';

export const INJECT_CONFIG_TOKEN = getConfigToken(CONFIG_DEFAULT_KEY);

export function InjectConfig() {
	return Inject(INJECT_CONFIG_TOKEN);
}
