import * as path from 'path'
import {build} from 'esbuild'

const definedGlobals = {}

function createBundles(watch: boolean) {
  const pathToPackage = path.join(__dirname, '../')
  const esbuildConfig: Parameters<typeof build>[0] = {
    entryPoints: [path.join(pathToPackage, 'src/index.ts')],
    bundle: true,
    sourcemap: true,
    define: definedGlobals,
    watch,
    platform: 'neutral',
    mainFields: ['browser', 'module', 'main'],
    target: ['firefox57', 'chrome58'],
    conditions: ['browser', 'node'],
  }

  build({
    ...esbuildConfig,
    outfile: path.join(pathToPackage, 'dist/index.js'),
    format: 'cjs',
  })

  // build({
  //   ...esbuildConfig,
  //   outfile: path.join(pathToPackage, 'dist/index.mjs'),
  //   format: 'esm',
  // })
}

createBundles(false)
