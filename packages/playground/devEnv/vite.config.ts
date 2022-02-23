import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {getAliasesFromTsConfigForRollup} from '../../../devEnv/getAliasesFromTsConfig'
import {definedGlobals} from '../../../theatre/devEnv/buildUtils'
import {existsSync, writeFileSync} from 'fs'

/*
We're using vite instead of the older pure-esbuild setup. The tradeoff is
that page reloads are much slower (>1s diff), while hot reload of react components
are instantaneous and of course, they preserve state.

@todo Author feels that the slow reloads are quite annoying and disruptive to flow,
so if you find a way to make them faster, please do.
*/

const playgroundDir = path.join(__dirname, '..')

const port = 8080

/**
 * Creates playground/src/index.ts, since that file isn't committed to the repo.
 */
function createPlaygroundIndex() {
  const playgroundIndexContent = `
  /**
   * This file is created automatically and won't be comitted to the repo.
   * You can change the import statement and import your own playground code.
   * 
   * Your own playground code should reside in './personal', which is a folder
   * that won't be committed to the repo.
   * 
   * The shared playgrounds which other contributors can use are in the './shared' folder,
   * which are comitted to the repo.
   * 
   * Happy playing!
   * */
  import './shared/r3f-rocket'
  `

  const playgroundEntry = path.join(playgroundDir, 'src/index.ts')
  if (!existsSync(playgroundEntry)) {
    writeFileSync(playgroundEntry, playgroundIndexContent, {encoding: 'utf-8'})
  }
}
createPlaygroundIndex()

// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(playgroundDir, './src'),
  assetsInclude: ['**/*.gltf', '**/*.glb'],
  server: {
    port,
  },

  plugins: [react()],
  resolve: {
    /*
    This will alias paths like `@theatre/core` to `path/to/theatre/core/src/index.ts` and so on,
    so vite won't treat the monorepo's packages as externals and won't pre-bundle them.
    */
    alias: [...getAliasesFromTsConfigForRollup()],
  },
  define: definedGlobals,
})
