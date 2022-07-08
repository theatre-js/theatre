import path = require('path')
import {build} from 'esbuild'

const definedGlobals = {
  'process.env.THEATRE_VERSION': JSON.stringify(
    require('../package.json').version,
  ),
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

  /**
   * We were initially externalizing react+fiber+drei+stdlib and having them as peer deps. Once we started to test this setup with different
   * versions of each, we realized that:
   *
   * 1. It can be confusing for npm users to satisfy the peer dep ranges. I (Aria) struggled to get the peer deps right in a sample project.
   * 2. More importantly, some permutations of these deps ended up not necessarily working together even though they satisfied the peer dep
   *    ranges.
   * 3. Also, since react 17 and 18 have subtly different behaviors (useEffect, suspend, etc), we thought that us having to support both of
   *    those behaviors in the snapshot editor is probably not that useful to the user. So we thought removing that surface area by bundling
   *    react into the snapshot editor would reduce the chance of running into bugs caused by the differences between react 17 and 18.
   *
   * So we made the call to bundle all of these libraries in the `/extension` bundle.
   *
   * The downsides we thought about:
   *
   * 1. The bundle size of the snapshot editor increases, but since users don't ship the snapshot editor to their end users, we thought this
   *    should be tolerable (let us know if it's not).
   * 2. Another downside we thought of is that having two versions of react and fiber on the same page may cause issues, but we haven't ran
   *   into any yet, so don't know if those issues couldn't be worked around.
   */
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
        'three',
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
