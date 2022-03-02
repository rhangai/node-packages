import { env, envInt, envBool } from '@rhangai/common';

export const configRegisterContext = {
	env,
	envInt,
	envBool,
};
export type ConfigRegisterContext = typeof configRegisterContext;
