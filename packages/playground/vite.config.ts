import {defineConfig} from 'vite'
// import react from '@vitejs/plugin-react'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
// import {mapValues} from 'lodash-es'
// import {PlaygroundPage} from './devEnv/home/PlaygroundPage'
import fg from 'fast-glob'
import {getAliasesFromTsConfigForRollup} from '../../devEnv/getAliasesFromTsConfig'
import {definedGlobals} from '../../theatre/devEnv/definedGlobals'
import devCommonJS from 'vite-plugin-commonjs'
// import {viteCommonjs as productionCommonJS} from '@originjs/vite-plugin-commonjs'
// import mpa from 'vite-plugin-mpa'
// import htmlTemplatePlugin from 'vite-plugin-html-template'

const fromPlaygroundDir = (folder: string) => path.resolve(__dirname, folder)
// const buildDir = playgroundDir('build')
const srcDir = fromPlaygroundDir('src')
const sharedDir = fromPlaygroundDir('src/shared')
const personalDir = fromPlaygroundDir('src/personal')
const testDir = fromPlaygroundDir('src/tests')

// https://vitejs.dev/config/
const config = defineConfig(async ({command}) => {
  const dev = command === 'serve'
  console.log('dev', dev)

  const groups = {
    shared: await fg(path.join(sharedDir, '*/index.html')),
    personal: await fg(path.join(personalDir, '*/index.html')),
    test: await fg(path.join(testDir, '*/index.html')),
  }

  const rollupInputs = (() => {
    // eg ['path/to/src/group/playground/index.html']
    const paths = ([] as string[]).concat(...Object.values(groups))

    // eg ['group/playground']
    const names = paths.map((entry) => {
      // convert "/path/to/src/group/playground/index.html" to "group/playground"
      const relativePath = path.relative(srcDir, entry)
      const entryName = relativePath.replace(/\/index\.html$/, '')
      return entryName
    })

    // eg { 'group/playground': 'path/to/src/group/playground/index.html' }
    return Object.fromEntries(names.map((name, index) => [name, paths[index]]))
  })()

  return {
    root: srcDir,
    plugins: [
      react(),
      dev ? devCommonJS() : /*productionCommonJS()*/ undefined,
    ],
    appType: 'mpa',
    server: {
      // base: '/playground/',
    },

    assetsInclude: ['**/*.gltf', '**/*.glb'],

    resolve: {
      /*
    This will alias paths like `@theatre/core` to `path/to/theatre/core/src/index.ts` and so on,
    so vite won't treat the monorepo's packages as externals and won't pre-bundle them.
    */
      alias: [...getAliasesFromTsConfigForRollup()],
    },
    define: {
      ...definedGlobals,
      'window.__IS_VISUAL_REGRESSION_TESTING': 'false',
    },
    optimizeDeps: {
      exclude: dev ? ['@theatre/core', '@theatre/studio'] : [],
      // include: !dev ? ['@theatre/core', '@theatre/studio'] : [],
      // needsInterop: ['@theatre/core', '@theatre/studio'],
    },
    build: {
      outDir: '../build',
      minify: false,
      sourcemap: true,

      rollupOptions: {
        input: {
          ...rollupInputs,
          main: fromPlaygroundDir('src/index.html'),
        },
      },
    },
  }
})

export default config
