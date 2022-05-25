import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import {getAliasesFromTsConfigForRollup} from '../../../devEnv/getAliasesFromTsConfig'
import {definedGlobals} from '../../../theatre/devEnv/buildUtils'

/*
We're using vite instead of the older pure-esbuild setup. The tradeoff is
that page reloads are much slower (>1s diff), while hot reload of react components
are instantaneous and of course, they preserve state.

@todo Author feels that the slow reloads are quite annoying and disruptive to flow,
so if you find a way to make them faster, please do.
*/

const playgroundDir = path.join(__dirname, '..')

const port = 8080

// https://vitejs.dev/config/
export default defineConfig({
  root: path.join(playgroundDir, './src'),
  build: {
    outDir: '../build',
    minify: false,
    emptyOutDir: true,
  },

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
  define: {
    ...definedGlobals,
    'window.__IS_VISUAL_REGRESSION_TESTING': 'true',
  },
})
