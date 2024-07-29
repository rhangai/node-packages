/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error ESLint padrão não tem tipos
import eslint from '@eslint/js';
// @ts-expect-error eslint-plugin-import não tem tipos
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginN from 'eslint-plugin-n';
import tseslint from 'typescript-eslint';
import { type EslintConfig, type EslintConfigRules } from './types';

// Extensions for files
const JS_EXTENSIONS = ['.js', '.jsx', '.mjs', '.cjs'];
const TS_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts'];
const EXTENSIONS = [...TS_EXTENSIONS, ...JS_EXTENSIONS];

// Common rules
const RULES = {
	base: {
		// ESLINT default rules
		'arrow-body-style': 'warn',
		camelcase: 'warn',
		curly: ['warn', 'all'],
		'default-case': 'warn',
		'default-case-last': 'error',
		'default-param-last': 'error',
		'dot-notation': 'warn',
		eqeqeq: [
			'warn',
			'always',
			{
				null: 'ignore',
			},
		],
		'guard-for-in': 'warn',
		'no-bitwise': 'warn',
		'no-console': 'warn',
		'no-constructor-return': 'error',
		'no-else-return': 'warn',
		'no-iterator': 'error',
		'no-lone-blocks': 'warn',
		'no-lonely-if': 'error',
		'no-loop-func': 'error',
		'no-param-reassign': ['warn', { props: true }],
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		'no-promise-executor-return': 'error',
		'no-proto': 'error',
		'no-return-assign': 'error',
		'no-sequences': 'error',
		'no-undef': 'warn',
		'no-unmodified-loop-condition': 'error',
		'no-useless-assignment': 'error',
		'object-shorthand': 'warn',
		'prefer-const': 'warn',
		'prefer-promise-reject-errors': 'error',
		'sort-imports': [
			'warn',
			{
				ignoreCase: true,
				ignoreDeclarationSort: true,
			},
		],
		// eslint-plugin-import
		'import/no-cycle': 'error',
	},
	node: {
		// eslint-plugin-n
		'n/prefer-node-protocol': 'warn',
	},
	js: {
		// Only JS
		'no-duplicate-imports': 'error',
		// Conflicts with typescript
		'consistent-return': 'warn',
		'no-shadow': 'error',
		'no-unused-vars': [
			'warn',
			{
				args: 'after-used',
				argsIgnorePattern: '^_',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_',
				destructuredArrayIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			},
		],
		'prefer-destructuring': 'warn',
		'require-await': 'warn',
	},
	ts: {
		// typescript-eslint
		'@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
		'@typescript-eslint/prefer-nullish-coalescing': [
			'warn',
			{
				ignoreConditionalTests: true,
				ignoreMixedLogicalExpressions: true,
				ignorePrimitives: { string: true, boolean: true },
			},
		],
		'@typescript-eslint/consistent-type-definitions': 'off',
		'@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
		'@typescript-eslint/no-inferrable-types': [
			'warn',
			{
				ignoreParameters: true,
				ignoreProperties: true,
			},
		],
		'@typescript-eslint/no-invalid-void-type': [
			'warn',
			{
				allowInGenericTypeArguments: true,
				allowAsThisParameter: true,
			},
		],
		'@typescript-eslint/no-non-null-assertion': 'warn',
		// BUG: This rules sometimes removes types that convert to any when the ts plugin fails
		'@typescript-eslint/no-unnecessary-type-arguments': 'off',
		'@typescript-eslint/prefer-string-starts-ends-with': [
			'warn',
			{
				allowSingleElementEquality: 'always',
			},
		],
		'@typescript-eslint/restrict-template-expressions': [
			'warn',
			{
				allowNumber: true,
			},
		],
		'@typescript-eslint/switch-exhaustiveness-check': ['warn'],
		'@typescript-eslint/unified-signatures': 'off',
		// Rules that conflicts with default eslint
		'consistent-return': 'off',
		'@typescript-eslint/consistent-return': 'warn',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{
				args: 'after-used',
				argsIgnorePattern: '^_',
				caughtErrors: 'all',
				caughtErrorsIgnorePattern: '^_',
				destructuredArrayIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			},
		],
		'prefer-destructuring': 'off',
		'@typescript-eslint/prefer-destructuring': [
			'warn',
			{ VariableDeclarator: { object: true } },
		],
		'require-await': 'off',
		'@typescript-eslint/require-await': 'warn',
		// Rules that does not work on ts
		'no-duplicate-imports': 'off',
		'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
		'import/no-duplicates': [
			'warn',
			{
				considerQueryString: true,
				'prefer-inline': true,
			},
		],
	},
	cjs: {
		'@typescript-eslint/no-var-requires': 'off',
	},
} satisfies Record<string, EslintConfigRules>;

export type {
	/**
	 * Config type
	 */
	EslintConfig,
	/**
	 * A rules type
	 */
	EslintConfigRules,
};

export type ConfigOptionsRestriction = {
	files: string | string[] | null;
	patterns?: Record<string, string | string[]>;
	paths?: Record<string, string>;
};

export type ConfigOptions = {
	/**
	 * Must be import.meta to resolve the files
	 */
	meta?: { dirname?: string; url?: string };
	/**
	 * True if in a monorepo package and all dependencies are on the root package.json
	 */
	monorepoPackageJson?: boolean;
	/**
	 * Internal packages regex
	 */
	internalPackagesRegex?: string;
	/**
	 * Extra parser options to be merged
	 */
	parserOptions?: Record<string, unknown>;
	/**
	 * Packages that must be imported first
	 */
	priorityPackages?: string[];
	/**
	 * Files for dev
	 */
	devFiles?: string[];
	/**
	 * Files for common js rules
	 */
	cjsFiles?: string[];
	/**
	 * Restrict import rules
	 */
	restrict?: ConfigOptionsRestriction[];
	/**
	 * Global variables
	 */
	globals?: Record<string, 'writable' | 'readonly' | 'off'>;
	/**
	 * Ignores linting the files
	 */
	ignores?: string[];
};

type Config = {
	/**
	 * General rules for typescript (node)
	 * @param options
	 * @returns
	 */
	ts: (options?: ConfigOptions) => EslintConfig[];
	/**
	 * General rules for typescript for web
	 * @param options
	 * @returns
	 */
	tsWeb: (options?: ConfigOptions) => EslintConfig[];
};
const config: Config = {
	ts: (options) =>
		createRules({
			options: options ?? null,
			extraConfig: {
				name: '@rhangai/esling-config-typescript/ts-node',
				plugins: {
					n: eslintPluginN,
				},
				rules: RULES.node,
			},
		}),
	tsWeb: (options) =>
		createRules({
			options: options ?? null,
		}),
};
export default config;

type CreateRulesParam = {
	options: ConfigOptions | null;
	extraConfig?: EslintConfig;
};

/**
 * Create the rules
 * @returns
 */
function createRules({ options, extraConfig }: CreateRulesParam): EslintConfig[] {
	const rootDir = resolveRootDir(options);
	const devFiles: string[] = options?.devFiles ?? [];
	const { restrictExtraConfig, restrictRules } = importRestrictRules(options);

	const ignores = options?.ignores;
	const globals = options?.globals;

	const eslintConfigs: Array<EslintConfig | null> = [
		ignores ? { ignores } : null,
		eslint.configs.recommended,
		...tseslint.configs.strictTypeChecked,
		...tseslint.configs.stylisticTypeChecked,
		{
			name: '@rhangai/esling-config-typescript/ts',
			plugins: {
				import: eslintPluginImport,
			},
			languageOptions: {
				parserOptions: {
					project: true,
					tsconfigRootDir: rootDir,
					...options?.parserOptions,
				},
				...(globals ? { globals } : {}),
			},
			rules: {
				...RULES.base,
				...RULES.ts,
				...restrictRules,
				'import/no-extraneous-dependencies': [
					'error',
					{
						packageDir: options?.monorepoPackageJson ? rootDir : undefined,
						devDependencies: [
							'eslint.config.*',
							'**/*.test.*',
							'**/*.spec.*',
							'**/spec/**/*',
							'**/test/**/*',
							'**/__tests__/**/*',
							...devFiles,
						],
					},
				],
				'import/order': ['error', importOrderOptions(options?.priorityPackages ?? [])],
			},
			settings: {
				'import/extensions': EXTENSIONS,
				'import/external-module-folders': ['node_modules', 'node_modules/@types'],
				'import/parsers': {
					'@typescript-eslint/parser': TS_EXTENSIONS,
				},
				'import/resolver': {
					node: {
						extensions: EXTENSIONS,
					},
				},
				'import/internal-regex': options?.internalPackagesRegex,
			},
		},
		...restrictExtraConfig,
		extraConfig,
		{
			...tseslint.configs.disableTypeChecked,
			name: '@rhangai/esling-config-typescript/ts-js',
			files: [`**/*.{${JS_EXTENSIONS.map((e) => e.substring(1)).join(',')}}`],
			rules: {
				...tseslint.configs.disableTypeChecked.rules,
				...RULES.js,
			},
		},
		{
			...tseslint.configs.disableTypeChecked,
			name: '@rhangai/esling-config-typescript/ts-cjs',
			files: [`**/*.cjs`, ...(options?.cjsFiles ?? [])],
			rules: {
				...RULES.cjs,
			},
			languageOptions: {
				globals: {
					module: 'readonly',
					require: 'readonly',
					__dirname: 'readonly',
					__filename: 'readonly',
				},
			},
		},
	];
	return eslintConfigs.filter(Boolean) as EslintConfig[];
}

/**
 * Get the path from the import meta
 */
function resolveRootDir(options: ConfigOptions | null): string | undefined {
	if (!options) {
		return undefined;
	}
	const { meta } = options;
	if (!meta) {
		return undefined;
	}
	if (meta.dirname) {
		return meta.dirname;
	}
	if (meta.url) {
		return dirname(fileURLToPath(meta.url));
	}
	return undefined;
}

/**
 * Create the import/order rule options
 */
function importOrderOptions(packages: string[]) {
	const pathGroups = packages.map((packageName) => ({
		pattern: packageName,
		group: 'external',
		position: 'before',
	}));
	return {
		groups: [
			//
			'builtin',
			'external',
			'internal',
			'parent',
			'sibling',
			'index',
		],
		pathGroups,
		pathGroupsExcludedImportTypes: ['builtin'],
		alphabetize: {
			order: 'asc',
			caseInsensitive: true,
		},
	};
}

type RestrictRulePattern = {
	group: string[];
	message: string;
};
type RestrictRulePath = {
	name: string;
	message: string;
};

/**
 * Create the restrict rules for the import
 */
function importRestrictRules(options: ConfigOptions | null) {
	const restrictExtraConfig: EslintConfig[] = [];
	const restrictRules: EslintConfigRules = {};

	const restrict = options?.restrict;
	if (!restrict) {
		return {
			restrictRules,
			restrictExtraConfig,
		};
	}

	const restrictRulePatterns: RestrictRulePattern[] = [];
	const restrictRulePaths: RestrictRulePath[] = [];
	for (const restriction of restrict) {
		const patterns = restrictionPatternMap(restriction);
		const paths = restrictionPathMap(restriction);

		if (!restriction.files || restriction.files.length <= 0) {
			if (patterns) {
				restrictRulePatterns.push(...patterns);
			}
			if (paths) {
				restrictRulePaths.push(...paths);
			}
			continue;
		}
		if (!patterns && !paths) {
			continue;
		}

		const ruleConfig: Record<string, unknown> = {};
		if (patterns) {
			ruleConfig.patterns = patterns;
		}
		if (paths) {
			ruleConfig.paths = paths;
		}
		restrictExtraConfig.push({
			files: Array.isArray(restriction.files) ? restriction.files : [restriction.files],
			rules: {
				'no-restricted-imports': ['error', ruleConfig],
			},
		});
	}
	if (restrictRulePatterns.length > 0 || restrictRulePaths.length > 0) {
		restrictRules['no-restricted-imports'] = [
			'error',
			{
				patterns: restrictRulePatterns,
				paths: restrictRulePaths,
			},
		];
	}
	return {
		restrictRules,
		restrictExtraConfig,
	};
}

function restrictionPatternMap(
	restriction: ConfigOptionsRestriction,
): RestrictRulePattern[] | null {
	if (!restriction.patterns) {
		return null;
	}
	const patterns: RestrictRulePattern[] = [];
	for (const [name, group] of Object.entries(restriction.patterns)) {
		if (Array.isArray(group)) {
			if (group.length <= 0) {
				continue;
			}
			patterns.push({
				group,
				message: `NÃO pode importar de "${name}"`,
			});
		} else if (group) {
			patterns.push({
				group: [group],
				message: `NÃO pode importar de "${name}"`,
			});
		}
	}
	if (patterns.length <= 0) {
		return null;
	}
	return patterns;
}

function restrictionPathMap(restriction: ConfigOptionsRestriction): RestrictRulePath[] | null {
	if (!restriction.paths) {
		return null;
	}
	const paths: RestrictRulePath[] = [];
	for (const [name, message] of Object.entries(restriction.paths)) {
		paths.push({
			name,
			message: message || `NÃO pode importar de "${name}"`,
		});
	}
	if (paths.length <= 0) {
		return null;
	}
	return paths;
}
