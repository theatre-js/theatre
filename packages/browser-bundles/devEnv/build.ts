import * as path from 'path'
import {build} from 'esbuild'
import type {Plugin} from 'esbuild'

const definedGlobals = {
  global: 'window',
}

function createBundles(watch: boolean) {
  const pathToPackage = path.join(__dirname, '../')
  const esbuildConfig: Parameters<typeof build>[0] = {
    bundle: true,
    sourcemap: true,
    define: definedGlobals,
    watch,
    platform: 'browser',
    loader: {
      '.png': 'dataurl',
      '.glb': 'dataurl',
      '.gltf': 'dataurl',
      '.svg': 'dataurl',
    },
    mainFields: ['browser', 'module', 'main'],
    target: ['firefox57', 'chrome58'],
    conditions: ['browser', 'node'],
  }

  // build({
  //   ...esbuildConfig,
  //   entryPoints: [path.join(pathToPackage, 'src/core-only.ts')],
  //   outfile: path.join(pathToPackage, 'dist/core-only.js'),
  //   format: 'iife',
  // })

  build({
    ...esbuildConfig,
    entryPoints: [path.join(pathToPackage, 'src/core-and-studio.ts')],
    outfile: path.join(pathToPackage, 'dist/core-and-studio.js'),
    format: 'iife',
  })

  build({
    ...esbuildConfig,
    entryPoints: [path.join(pathToPackage, 'src/core-only.ts')],
    outfile: path.join(pathToPackage, 'dist/core-only.min.js'),
    minify: true,
    format: 'iife',
    define: {
      ...definedGlobals,
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  })

  // build({
  //   ...esbuildConfig,
  //   outfile: path.join(pathToPackage, 'dist/index.mjs'),
  //   format: 'esm',
  // })
}

createBundles(false)
