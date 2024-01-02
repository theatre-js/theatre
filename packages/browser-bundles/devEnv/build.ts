import * as path from 'path'
import * as esbuild from 'esbuild'
import {definedGlobals} from '../../core/devEnv/definedGlobals'

function createBundles() {
  const pathToPackage = path.join(__dirname, '../')
  const esbuildConfig: Parameters<typeof esbuild.context>[0] = {
    bundle: true,
    sourcemap: true,
    define: {
      ...definedGlobals,
      __IS_VISUAL_REGRESSION_TESTING: 'false',
      'process.env.NODE_ENV': '"production"',
    },
    platform: 'browser',
    supported: {
      // 'unicode-escapes': false,
      'template-literal': false,
    },
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

  void esbuild.build({
    ...esbuildConfig,
    entryPoints: [path.join(pathToPackage, 'src/core-and-studio.ts')],
    outfile: path.join(pathToPackage, 'dist/core-and-studio.js'),
    format: 'iife',
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: false,
    treeShaking: true,
  })

  void esbuild.build({
    ...esbuildConfig,
    entryPoints: [path.join(pathToPackage, 'src/core-only.ts')],
    outfile: path.join(pathToPackage, 'dist/core-only.min.js'),
    minify: true,
    format: 'iife',
  })
}

createBundles()
