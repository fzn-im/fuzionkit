import { fileURLToPath } from 'node:url';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import type { Plugin, RollupOptions, WarningHandlerWithDefault } from 'rollup';
import { string } from 'rollup-plugin-string';
import { moduleAliases } from './build-plugins/aliases';
import cleanBeforeWrite from './build-plugins/clean-before-write';
import { copyBrowserTypes, copyNodeTypes } from './build-plugins/copy-types';
import emitModulePackageFile from './build-plugins/emit-module-package-file';
import esmDynamicImport from './build-plugins/esm-dynamic-import';

const onwarn: WarningHandlerWithDefault = warning => {
  // eslint-disable-next-line no-console
  console.error(
    'Building Rollup produced warnings that need to be resolved. ' +
    'Please keep in mind that the browser build may never have external dependencies!',
  );
  // eslint-disable-next-line unicorn/error-message
  throw Object.assign(new Error(), warning);
};

const treeshake = {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  tryCatchDeoptimization: false,
};

const nodePlugins: readonly Plugin[] = [
  alias(moduleAliases),
  nodeResolve(),
  json(),
  string({ include: '**/*.md' }),
  commonjs({
    ignoreTryCatch: false,
    include: 'node_modules/**',
  }),
  typescript(),
  cleanBeforeWrite('dist'),
];

export default async function(
  command: Record<string, unknown>,
): Promise<RollupOptions | RollupOptions[]> {

  const commonJSBuild: RollupOptions = {
    // 'fsevents' is a dependency of 'chokidar' that cannot be bundled as it contains binary code
    external: [ 'fsevents' ],
    input: {
      'loadConfigFile.js': 'cli/run/loadConfigFile.ts',
      'rollup.js': 'src/node-entry.ts',
    },
    onwarn,
    output: {
      chunkFileNames: 'shared/[name].js',
      dir: 'dist',
      entryFileNames: '[name]',
      exports: 'named',
      externalLiveBindings: false,
      format: 'cjs',
      freeze: false,
      generatedCode: 'es2015',
      interop: 'default',
      sourcemap: true,
    },
    plugins: [
      ...nodePlugins,
      esmDynamicImport(),
      !command.configTest && copyNodeTypes(),
    ],
    strictDeprecations: true,
    treeshake,
  };

  if (command.configTest) {
    return commonJSBuild;
  }

  const esmBuild: RollupOptions = {
    ...commonJSBuild,
    input: { 'rollup.js': 'src/node-entry.ts' },
    output: {
      ...commonJSBuild.output,
      dir: 'dist/es',
      format: 'es',
      minifyInternalExports: false,
      sourcemap: false,
    },
    plugins: [ ...nodePlugins, emitModulePackageFile() ],
  };

  const browserBuilds: RollupOptions = {
    input: 'src/browser-entry.ts',
    onwarn,
    output: [
    ],
    plugins: [
      alias(moduleAliases),
      nodeResolve({ browser: true }),
      json(),
      commonjs(),
      typescript(),
      terser({ module: true, output: { comments: 'some' } }),
      cleanBeforeWrite('browser/dist'),
      {
        closeBundle(): void {
          // On CI, macOS runs sometimes do not close properly. This is a hack
          // to fix this until the problem is understood.
          console.log('Force quit.');
          setTimeout(() => process.exit(0));
        },
        name: 'force-close',
      },
    ],
    strictDeprecations: true,
    treeshake,
  };

  return [ commonJSBuild, esmBuild, browserBuilds ];
}
