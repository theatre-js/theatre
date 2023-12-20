import path from 'path'
import * as esbuild from 'esbuild'
import {definedGlobals} from './definedGlobals'

export async function createBundles(watch: boolean) {
  for (const which of ['core', 'studio']) {
    const pathToPackage = path.join(__dirname, '../', which)
    const esbuildConfig: Parameters<typeof esbuild.context>[0] = {
      entryPoints: [path.join(pathToPackage, 'src/index.ts')],
      target: ['es6'],
      loader: {'.png': 'file', '.svg': 'dataurl'},
      bundle: true,
      sourcemap: true,
      supported: {
        // 'unicode-escapes': false,
        'template-literal': false,
      },
      define: {
        ...definedGlobals,
        __IS_VISUAL_REGRESSION_TESTING: 'false',
      },
      external: [
        '@theatre/dataverse',
        /**
         * Prevents double-bundling react.
         *
         * @remarks
         * Ideally we'd want to just bundle our own fixed version of react to keep things
         * simple, but for now we keep react external because we're exposing these
         * react-dependant API from \@theatre/studio:
         *
         * - `ToolbarIconButton`
         * - `IStudio['extend']({globalToolbar: {component}})`
         *
         * These are further exposed by \@theatre/r3f which provides `<Wrapper />`
         * as an API.
         *
         * It's probably possible to bundle our own react version and somehow share it
         * with the plugins, but that's not urgent atm.
         */
        // 'react',
        // 'react-dom',
        // 'styled-components',
      ],
    }

    if (which === 'core') {
      esbuildConfig.platform = 'neutral'
      esbuildConfig.mainFields = ['browser', 'module', 'main']
      esbuildConfig.target = ['firefox57', 'chrome58']
      esbuildConfig.conditions = ['browser', 'node']
    } else {
      esbuildConfig.define!['process.env.NODE_ENV'] =
        JSON.stringify('production')

      esbuildConfig.minify = true
    }

    const ctx = await esbuild.context({
      ...esbuildConfig,
      outfile: path.join(pathToPackage, 'dist/index.js'),
      format: 'cjs',
    })

    if (watch) {
      await ctx.watch()
    } else {
      await ctx.rebuild()
      await ctx.dispose()
    }

    /**
     * @remarks
     * I just disabled ESM builds because I couldn't get them to work
     * with create-react-app which uses webpack v4. I'm sure that's fixable,
     * but not worth the hassle right now. There is not much to tree-shake
     * in \@theatre/core as we've done all the tree-shaking pre-bundle already.
     */

    // build({
    //   ...esbuildConfig,
    //   outfile: path.join(pathToPackage, 'dist/index.mjs'),
    //   format: 'esm',
    // })

    // build({
    //   ...esbuildConfig,
    //   outfile: path.join(pathToPackage, 'dist/index.min.js'),
    //   format: 'iife',
    //   external: [],
    //   minify: true,
    //   globalName: `Theatre.${which}`,
    //   legalComments: 'external',
    //   platform: 'browser',
    //   define: {
    //     ...definedGlobals,
    //     'process.env.NODE_ENV': JSON.stringify('production'),
    //   },
    // })
  }
}
