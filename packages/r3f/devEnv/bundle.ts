import path = require('path')
import {build} from 'esbuild'

const definedGlobals = {
  'process.env.version': JSON.stringify(require('../package.json').version),
  'process.env.NODE_ENV': JSON.stringify('production'),
}

createBundles()

async function createBundles() {
  createMainBundle()
  createExtensionBundle()

  async function createMainBundle() {
    const pathToEntry = path.join(__dirname, '../src/index.ts')
    const esbuildConfig: Parameters<typeof build>[0] = {
      entryPoints: [pathToEntry],
      target: ['es6'],
      loader: {'.svg': 'text', '.png': 'dataurl'},
      bundle: true,
      sourcemap: true,
      define: {...definedGlobals},
      external: [
        '@theatre/core',
        '@theatre/dataverse',
        '@theatre/react',
        '@theatre/studio',
        'react',
        'react-dom',
        'three',
        '@react-three/fiber',
      ],
      platform: 'browser',
      mainFields: ['browser', 'module', 'main'],
      conditions: ['browser', 'node'],
      outfile: path.join(__dirname, '../dist/index.js'),
      format: 'cjs',
      metafile: true,
    }

    const result = await build(esbuildConfig)
  }

  async function createExtensionBundle() {
    const pathToEntry = path.join(__dirname, '../src/extension/index.ts')
    const esbuildConfig: Parameters<typeof build>[0] = {
      entryPoints: [pathToEntry],
      target: 'es6',
      loader: {'.svg': 'text', '.png': 'dataurl'},
      bundle: true,
      sourcemap: true,
      define: {...definedGlobals},
      external: [
        '@theatre/core',
        '@theatre/studio',
        '@theatre/dataverse',
        '@theatre/r3f',
        // 'three',
        // '@react-three/fiber',
        // '@react-three/drei',
        // 'three-stdlib',
      ],
      platform: 'browser',
      mainFields: ['browser', 'module', 'main'],
      conditions: ['browser'],
      outfile: path.join(__dirname, '../dist/extension/index.js'),
      format: 'cjs',
      metafile: true,
    }

    const result = await build(esbuildConfig)
  }
}
