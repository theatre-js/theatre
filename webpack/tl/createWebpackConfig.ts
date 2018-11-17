// import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze} from 'immer'
// import * as CircularDependencyDetector from 'circular-dependency-plugin'
import * as webpack from 'webpack'
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'
import * as fs from 'fs-extra'
import * as path from 'path'
// import * as UglifyJSWebpackPlugin from 'uglifyjs-webpack-plugin'

setAutoFreeze(false)

module.exports = (env: Envs) => {
  const isDev = env === 'development'

  // if (isDev) {
  //   return makeBundle('index')
  // } else {
  return [makeBundle('index'), makeBundle('core')]
  // }

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
      // if (!isDev) {
      c.output.filename = `${which}.js`
      // }

      if (which === 'core') {
        if (isDev) {
          c.plugins.push(
            new webpack.DefinePlugin({'$env.tl.isCore': JSON.stringify(true)}),
          )
        }
        // c.plugins.push(
        //   new webpack.IgnorePlugin(/\/types\.tsx?$/),
        //   new webpack.IgnorePlugin(/ioTypes/),
        // )
        // exclude all runtime types if we're building for core in production
        c.module.rules.unshift({
          test: [/\/types\.tsx?$/, /lodash/, /ioTypes/],
          use: 'null-loader',
          exclude: /node_modules/,
        })
      }

      if (!isDev) {
        // c.plugins.unshift()

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

      // c.plugins.push(
      //   /**
      //    * Enable this if you suspect an error is caused by circular dependencies.
      //    * Note that we do have a bunch of circular dependencies that don't cause
      //    * any trouble
      //    */
      //   // new CircularDependencyDetector({
      //   //   cwd: parts.srcDir,
      //   //   exclude: /\/node_modules\/|\/DataVerse\//,
      //   // })
      // )
    })
  }
}
