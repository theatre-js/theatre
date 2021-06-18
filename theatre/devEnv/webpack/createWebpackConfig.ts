import type {$FixMe, $IntentionalAny} from '@theatre/shared/utils/types'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import * as fs from 'fs-extra'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import {setAutoFreeze as setImmerAutoFreeze} from 'immer'
// eslint-disable-next-line no-restricted-imports
import {isPlainObject} from 'lodash'
import * as path from 'path'
import * as webpack from 'webpack'
import {ESBuildMinifyPlugin} from 'esbuild-loader'
// eslint-disable-next-line no-relative-imports
import {getAliasesFromTsConfigForWebpack} from '../../../devEnv/getAliasesFromTsConfig.js'
import esbuild from 'esbuild'

setImmerAutoFreeze(false)

export const privatePackageRoot = path.resolve(__dirname, '../..')

export default (type: 'playground' | 'development' | 'production') => {
  const isDev = type === 'development' || type === 'playground'

  const bundles: Array<'playground' | 'studio' | 'core'> =
    type === 'playground' ? ['playground'] : ['core', 'studio']

  return bundles.map((which) => {
    const envConfig = getEnvConfig(isDev)
    envConfig.isCore = which === 'core'
    envConfig.version = require('../../package.json').version
    const packageRoot = path.join(
      privatePackageRoot,
      which === 'playground' ? 'studio' : which,
    )

    const packageDevSpecificConfig = envConfig.devSpecific

    const config: webpack.Configuration = {
      entry:
        which === 'playground'
          ? './src/playground/index.tsx'
          : `./src/index.ts`,
      output: {
        libraryTarget: 'umd',
        library: 'Theatre_' + which,
        filename: `index.js`,
        path: path.join(packageRoot, 'dist'),
        // sourceMapFilename: '[file].map',
        devtoolModuleFilenameTemplate: (info: {absoluteResourcePath: string}) =>
          path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
      },
      context: packageRoot,
      devtool: isDev
        ? type === 'playground'
          ? 'cheap-module-source-map'
          : 'source-map'
        : 'source-map',
      mode: isDev ? 'development' : 'production',
      node: {
        global: true,
      },
      plugins: [new CaseSensitivePathsPlugin()],
      resolve: {
        alias: getAliasesFromTsConfigForWebpack(),
        extensions: ['.tsx', '.ts', '.js', '.json', '.css'],
        // @todo For some reason, importing react-window or react-functional-select fails
        // if `main: module` is enabled.
        mainFields: ['module', 'main'],
        plugins: [],
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: [
              // {
              //   loader: require.resolve('babel-loader'),
              //   options: {
              //     rootMode: 'upward',
              //     envName: envConfig.NODE_ENV,
              //   },
              // },
              {
                loader: require.resolve('esbuild-loader'),
                options: {
                  loader: 'tsx',
                  implementation: esbuild,
                  target: 'esnext',
                },
              },
            ],
          },
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // its runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [
              /\.js$/,
              /\.tsx?$/,
              /\.html?$/,
              /\.json$/,
              /\.css$/,
              /\.svg$/,
            ],
            loader: require.resolve('file-loader'),
            options: {
              name: 'static/media/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    }

    if (type === 'playground') {
      const htmlPluginTemplateParameters = (
        compilation: $FixMe,
        assets: $FixMe,
        options: $FixMe,
      ) => ({
        onv: envConfig,
        compilation: compilation,
        webpack: compilation.getStats().toJson(),
        webpackConfig: compilation.options,
        htmlWebpackPlugin: {
          files: assets,
          options: options,
        },
      })

      config.plugins!.push(
        new HtmlWebpackPlugin({
          inject: false,
          template: './src/playground/playground.html',
          filename: 'index.html',
          templateParameters: htmlPluginTemplateParameters,
        }) as $FixMe,
      )
    }

    if (type === 'playground') {
      config.stats = 'errors-warnings'
      config.plugins!.push(new webpack.HotModuleReplacementPlugin())

      const sslConfig = envConfig.devSpecific.devServerSSL
      const https: boolean = sslConfig && sslConfig.useSSL === true

      // @ts-expect-error
      config.devServer = {
        publicPath: `${https ? 'https' : 'http'}://${
          envConfig.devSpecific.devServerHost
        }:${packageDevSpecificConfig.devServerPort}/`,
        host: '0.0.0.0',
        hot: true,
        historyApiFallback: true,
        public: `${https ? 'https://' : ''}${
          envConfig.devSpecific.devServerHost
        }:${packageDevSpecificConfig.devServerPort}`,
        allowedHosts: [envConfig.devSpecific.devServerHost, '.localtunnel.me'],
        noInfo: false,
        // quiet: true,
        stats: false,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'SourceMap,X-SourceMap',
        },
        port: packageDevSpecificConfig.devServerPort,
      }

      if (https) {
        // @ts-ignore ignore
        config.devServer.https = {
          key: fs.readFileSync(sslConfig.pathToKey),
          cert: fs.readFileSync(sslConfig.pathToCert),
        }
      }
    }

    if (which === 'core') {
      config.plugins!.push(
        new webpack.DefinePlugin({'$env.isCore': JSON.stringify(true)}),
      )
    }

    if (!isDev) {
      config.stats = {
        // @ts-ignore
        optimizationBailout: true,
      }

      config.optimization = {
        minimizer: [
          new ESBuildMinifyPlugin({
            target: 'esnext',
          }),
        ],
      }
    }

    // defined process.env and $env
    config.plugins!.push(
      new webpack.DefinePlugin(
        convertObjectToWebpackDefinePaths({
          process: {env: envConfig},
          $env: envConfig,
        }),
      ),
    )

    return config
  })
}

export function getEnvConfig(isDev: boolean) {
  const which = isDev ? 'development' : 'production'

  const filename = `${which}.env.json`

  const pathtoEnvFile = path.join(privatePackageRoot, filename)

  if (!fs.existsSync(pathtoEnvFile)) {
    const sampleEnvFilename = 'sample.env.json'
    const sampleEnvContent = JSON.parse(
      fs.readFileSync(path.join(privatePackageRoot, sampleEnvFilename), {
        encoding: 'utf-8',
      }),
    )

    const newEnv = {...sampleEnvContent}
    newEnv.NODE_ENV = which
    if (!isDev) {
      delete newEnv['devSpecific']
    }

    fs.writeFileSync(pathtoEnvFile, JSON.stringify(newEnv, undefined, 2), {
      encoding: 'utf-8',
    })

    console.log(`\n${filename} was created from ${sampleEnvFilename}`)
  }

  return require(pathtoEnvFile)
}

/**
 * @example
 * convertObjectToWebpackDefinePaths({foo: {bar: 'baz}}) // => {'foo.bar': 'baz'}
 */
export function convertObjectToWebpackDefinePaths(
  obj: unknown,
): Record<string, string> {
  const processed: Record<string, string> = {}
  const process = (v: $IntentionalAny, ns: string[]) => {
    if (ns.length > 0) {
      processed[ns.join('.')] = JSON.stringify(v)
    }
    if (isPlainObject(v)) {
      Object.keys(v).forEach((key) => {
        process(v[key], [...ns, key])
      })
    }
  }
  process(obj, [])
  return processed
}
