import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
		graphql: 'src/graphql/index.ts',
		typeorm: 'src/typeorm/index.ts',
	},
});
