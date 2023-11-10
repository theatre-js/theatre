import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import fg from 'fast-glob'
import {getAliasesFromTsConfigForRollup} from '../../devEnv/getAliasesFromTsConfig'
import {definedGlobals} from '../../theatre/devEnv/definedGlobals'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

const fromPlaygroundDir = (folder: string) => path.resolve(__dirname, folder)
const srcDir = fromPlaygroundDir('src')
const sharedDir = fromPlaygroundDir('src/shared')
const personalDir = fromPlaygroundDir('src/personal')
const testDir = fromPlaygroundDir('src/tests')

const repoRoot = path.resolve(__dirname, '../..')

function findAppUrl() {
  const defaultUrl = 'https://app.theatrejs.com'

  function validateURL(url: string) {
    const pattern = new RegExp('^https?:\\/\\/[^\\s/$.?#].[^\\s]*$', 'i')
    return pattern.test(url)
  }

  const pathToAppEnv = path.resolve(repoRoot, 'packages/app/.env')

  const relativePath = path.relative(repoRoot, pathToAppEnv)

  if (!fs.existsSync(pathToAppEnv)) {
    console.warn(
      `WARNING: the .env file at ${relativePath} does not exist, so we'll assume the web app's url is at https://app.theatrejs.com`,
    )
  } else {
    const envFileContent = fs.readFileSync(pathToAppEnv, {encoding: 'utf-8'})
    try {
      const webAppEnv = dotenv.parse(envFileContent)
      const url = 'http://' + webAppEnv.HOST + ':' + webAppEnv.PORT
      if (validateURL(url)) {
        console.info(`Using ${url} as the app url, read from ${relativePath}`)
        return url
      } else {
        console.warn(
          `WARNING: HOST/PORT values in ${relativePath} don't form a correct URL. Defaulting to ${defaultUrl}`,
        )
        return defaultUrl
      }
    } catch (err) {
      console.warn(`WARNING: Could not read ${relativePath}`)
    }
  }

  return defaultUrl
}

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
    plugins: [react()],
    appType: 'mpa',
    server: {
      port: 8082,
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
      'process.env.BACKEND_URL': JSON.stringify(findAppUrl()),
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
