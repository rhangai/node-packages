import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		typeorm: 'src/typeorm/index.ts',
		index: 'src/index.ts',
	},
});
