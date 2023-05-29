const importRules = require('eslint-config-airbnb-base/rules/imports').rules;

const extensionsJs = ['.js', '.cjs', '.mjs'];
const extensionsTs = ['.ts', '.mts', '.cts'];
const extensionsCode = [...extensionsJs, ...extensionsTs];
const extensions = [...extensionsCode, ...extensionsCode.map((ext) => `${ext}x`)];

module.exports = {
	extensionsJs,
	extensionsTs,
	extensionsCode,
	extensions,
	createNoExtraneousDependenciesOptions(packageDir) {
		return {
			...importRules['import/no-extraneous-dependencies'][1],
			devDependencies: [
				...importRules['import/no-extraneous-dependencies'][1].devDependencies.flatMap(
					(devDep) => {
						// Ends with js
						if (devDep.endsWith('.js')) {
							const base = devDep.substr(0, devDep.length - 3);
							return `${base}.{js,cjs,mjs,ts,cts,mts}`;
						}

						// Ends with glob
						const match = /\{(.*?)\}$/.exec(devDep);
						if (match) {
							const set = new Set(match[1].split(','));
							if (set.has('jsx')) {
								extensions.forEach((ext) => set.add(ext.substring(1)));
							} else if (set.has('.jsx')) {
								extensions.forEach((ext) => set.add(ext));
							} else if (set.has('js')) {
								extensionsCode.forEach((ext) => set.add(ext.substring(1)));
							} else if (set.has('.js')) {
								extensionsCode.forEach((ext) => set.add(ext));
							}
							const base = devDep.substring(0, match.index);
							const exts = Array.from(set).join(',');
							return `${base}{${exts}}`;
						}
						return devDep;
					}
				),
				'**/*.stories.{cts,mts,ts,tsx,cjs,mjs,js,jsx,mdx}',
			],
			packageDir,
		};
	},
};
