import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze as setImmerAutoFreeze} from 'immer'
import * as webpack from 'webpack'
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as TerserPlugin from 'terser-webpack-plugin'
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const WebpackDeepScopeAnalysisPlugin = require('webpack-deep-scope-plugin')
  .default

setImmerAutoFreeze(false)

module.exports = (env: Envs) => {
  const isDev = env === 'development'

  if (isDev) {
    return makeBundle('index')
  } else {
    return [makeBundle('index'), makeBundle('core')]
  }

  function makeBundle(which: 'index' | 'core') {
    const parts = makeConfigParts({
      env,
      withReactHotLoading: false,
      packageName: 'tl',
      withDevServer: isDev,
      entries: {
        index: [`./src/tl/entries/${which}.ts`],
      },
      extraEnv: {
        tl: {
          isCore: which === 'core',
        },
      },
    })

    return immer(parts.config, c => {
      c.output.libraryTarget = 'umd'
      c.output.library = 'Theatre'
      c.output.filename = `${which}.js`

      if (which === 'core') {
        if (isDev) {
          c.plugins.push(
            new webpack.DefinePlugin({'$env.tl.isCore': JSON.stringify(true)}),
          )
        } else {
          c.stats = {
            // @ts-ignore
            optimizationBailout: true,
          }
          c.plugins.push(new WebpackDeepScopeAnalysisPlugin())
          c.plugins.unshift(
            new LodashModuleReplacementPlugin({
              paths: true,
            }),
          )

          c.module.rules.unshift({
            test: [/store\/index\.ts/, /\/propSanitizers\.ts$/],
            use: 'null-loader',
            exclude: /node_modules/,
          })
        }
        /**
         * All modules matching these expressions will be skipped from the bundle.
         * Note that after webpack's tree-shaking becomes smarter, this rule shouldn't
         * be needed anymore
         */
        c.module.rules.unshift({
          test: [/\/types\.tsx?$/, /lodash/, /ioTypes/],
          use: 'null-loader',
          exclude: /node_modules/,
        })
      } else if (isDev) {
        /**
         * Uncomment this if you suspect there are files in the project we don't need.
         * After you decide which files to remove, comment this again.
         */
        // const UnusedWebpackPlugin = require('unused-webpack-plugin')
        // c.plugins.push(
        //   new UnusedWebpackPlugin({
        //     // Source directories
        //     directories: [parts.srcDir],
        //     // Exclude patterns
        //     exclude: ['*.test.ts', '*.test.tsx', '*.d.ts'],
        //     // Root directory (optional)
        //     root: parts.context,
        //   }),
        // )
      }

      if (!isDev) {
        if (!c.optimization) {
          c.optimization = {}
        }
        c.optimization!.minimizer = [
          new TerserPlugin({
            terserOptions: {
              mangle: {
                reserved: [
                  'TheatreObject',
                  'TheatreTimeline',
                  'TheatreProject',
                  'TheatreAdaptersManager',
                  'InvalidArgumentError',
                  'TheatreError'
                ],
              },
            },
          }),
        ]

        c.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: which + '.report.html',
            generateStatsFile: true,
            statsFilename: which + '.stats.json',
            openAnalyzer: false,
          }),
        )

        const pathToLicense = path.join(
          parts.context,
          'distributions/theatre/LICENSE.md',
        )
        const licenseText = fs.readFileSync(pathToLicense, 'utf-8')

        c.plugins.push(new webpack.BannerPlugin(licenseText))
      }

      /**
       * Uncomment this if you suspect an error is caused by circular dependencies.
       * Note that we do have a bunch of circular dependencies that don't cause
       * trouble
       */
      // const CircularDependencyDetector = require('circular-dependency-plugin')
      // c.plugins.push(
      //   new CircularDependencyDetector({
      //     cwd: parts.srcDir,
      //     exclude: /\/node_modules\/|\/DataVerse\//,
      //   }),
      // )
    })
  }
}
