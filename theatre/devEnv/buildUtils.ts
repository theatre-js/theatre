import path from 'path'
import {build} from 'esbuild'

export const definedGlobals = {
  global: 'window',
  'process.env.version': JSON.stringify(
    require('../studio/package.json').version,
  ),
}

export function createBundles(watch: boolean) {
  for (const which of ['core', 'studio']) {
    const pathToPackage = path.join(__dirname, '../', which)
    const esbuildConfig: Parameters<typeof build>[0] = {
      entryPoints: [path.join(pathToPackage, 'src/index.ts')],
      target: ['es6'],
      loader: {'.png': 'file'},
      bundle: true,
      sourcemap: true,
      define: definedGlobals,
      watch,
      external: ['@theatre/dataverse'],
    }

    if (which === 'core') {
      esbuildConfig.platform = 'neutral'
      esbuildConfig.mainFields = ['browser', 'module', 'main']
      esbuildConfig.target = ['firefox57', 'chrome58']
      esbuildConfig.conditions = ['browser', 'node']
    }

    build({
      ...esbuildConfig,
      outfile: path.join(pathToPackage, 'dist/index.cjs'),
      format: 'cjs',
    })

    build({
      ...esbuildConfig,
      outfile: path.join(pathToPackage, 'dist/index.mjs'),
      format: 'esm',
    })

    build({
      ...esbuildConfig,
      outfile: path.join(pathToPackage, 'dist/index.min.js'),
      format: 'iife',
      external: [],
      minify: true,
      globalName: `Theatre.${which}`,
      legalComments: 'external',
      platform: 'browser',
      define: {
        ...definedGlobals,
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
    })
  }
}
