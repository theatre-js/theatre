import * as path from 'path'
import * as CleanPlugin from 'clean-webpack-plugin'
import * as WebpackNotifierPlugin from 'webpack-notifier'
import * as webpack from 'webpack'
import * as CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import * as TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import {mapValues, isPlainObject, mapKeys, merge as mergeDeep} from 'lodash'
import * as ErrorOverlayPlugin from 'error-overlay-webpack-plugin'

export const context = path.resolve(__dirname, '..')

const aliasesFromRoot = {
  $root: './',
  $src: './src/',
  $lb: './src/lb/',
  $lf: './src/lf/',
  $tl: './src/tl/',
  $studio: './src/studio/',
  $shared: './src/shared/',
}

export const aliases: {[alias: string]: string} = mapValues(
  aliasesFromRoot,
  fromRoot => path.join(context, fromRoot),
)

type PackageName = 'studio' | 'playground' | 'examples' | 'lb' | 'lf' | 'tl'

export type Envs = 'development' | 'production'

export type Options = {
  env: 'development' | 'production'
  withReactHotLoading?: boolean
  packageName: PackageName
  entries?: {[key: string]: string[]}
  withDevServer?: boolean
  withServerSideHotLoading?: boolean
  extraEnv?: {[key: string]: {}}
  // supportEs5?: boolean
}

const babelForTsHotReloading = () => ({
  loader: require.resolve('babel-loader'),
  options: {
    babelrc: false,
    plugins: [
      'react-hot-loader/babel',
      // this one is needed if we want to avoid the 'setState() cannot be called un an unmounted component' errors
      'transform-es2015-classes',
    ],

    // This is a feature of `babel-loader` for webpack (not Babel itself).
    // It enables caching results in ./node_modules/.cache/babel-loader/
    // directory for faster rebuilds.
    cacheDirectory: true,
  },
})

export const makeConfigParts = (options: Options) => {
  const {packageName} = options
  const isDev = options.env === 'development'
  const envConfig = require(path.join(context, `${options.env}.env.json`))
  const bundlesDir = path.join(context, `./bundles/${packageName}`)
  const srcDir = path.join(context, 'src')
  const packageDevSpecificConfig = envConfig.devSpecific[packageName]

  // Don't let this global bother you. It's just a hack to make $root/webpack/env/dotEnvFile.js work
  // both inside a webpack bundle and outside. And that is the only place this global is used.
  // @ts-ignore
  global.$$$NODE_ENV = options.env

  const nodeEnv = isDev ? {} : {...require('./env/nodeEnv')}
  mergeDeep(nodeEnv, options.extraEnv || {})
  mergeDeep(nodeEnv, {version: require('../package.json').version})

  const envStuff: {[k: string]: string} = {}
  const process = (v: $IntentionalAny, ns: string[]) => {
    if (isPlainObject(v)) {
      Object.keys(v).forEach(key => {
        process(v[key], [...ns, key])
      })
    } else {
      envStuff[ns.join('.')] = JSON.stringify(v)
    }
  }
  process(nodeEnv, [])
  const toDefine = {
    ...mapKeys(envStuff, (_, k) => 'process.env.' + k),
    ...mapKeys(envStuff, (_, k) => '$env.' + k),
  }

  const config: webpack.Configuration & {
    output: webpack.Output
    plugins: webpack.Plugin[]
    module: webpack.Module
    resolve: webpack.Resolve
  } = {
    entry: mapValues(
      options.entries || {},
      ent => ent,
      // options.withReactHotLoading && isDev
      //   ? [
      //       require.resolve('react-dev-utils/webpackHotDevClient'),
      //       require.resolve('react-hot-loader/patch'),
      //     ].concat(ent)
      //   : options.withServerSideHotLoading
      //     ? ['webpack/hot/poll?100'].concat(ent)
      //     : ent,
    ),
    output: {
      path: bundlesDir,
      filename: '[name].js',
      sourceMapFilename: '[file].map',
      devtoolModuleFilenameTemplate: info =>
        path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    // studioConfig: envConfig,
    context: context,
    devtool: isDev
      ? 'cheap-module-source-map'
      : /*'hidden-source-map'*/ 'source-map',
    mode: isDev ? 'development' : 'production',
    node: {
      process: false,
    },
    resolve: {
      alias: aliases,
      extensions: ['.tsx', '.ts', '.js', '.json', '.css'],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: require.resolve('../tsconfig.json'),
        }),
      ],
    },
    plugins: [
      new CleanPlugin([bundlesDir], {root: context}),
      new webpack.DefinePlugin({
        // This is only used inside `$root/webpack/env/index.js` and there it is
        // mirrored in process.env.NODE_ENV. So read this value from process.env.NODE_ENV.
        $$$NODE_ENV: JSON.stringify(options.env),
      }),

      new CaseSensitivePathsPlugin(),
      ...(isDev
        ? [
            new webpack.ProvidePlugin({
              'process.env': '$root/webpack/env/index.js',
              $env: '$root/webpack/env/index.js',
            }),
            new webpack.HotModuleReplacementPlugin(),
            new WebpackNotifierPlugin(),
            // new webpack.NoEmitOnErrorsPlugin(),
            new webpack.NamedModulesPlugin(),
            // If you require a missing module and then `npm install` it, you still have
            // to restart the development server for Webpack to discover it. This plugin
            // makes the discovery automatic so you don't have to restart.
            // See https://github.com/facebookincubator/create-react-app/issues/186
            // @todo Doesn't work with webpack 4 atm
            // new WatchMissingNodeModulesPlugin(
            //   path.resolve(__dirname, '../node_modules'),
            // ),
            ...(options.withDevServer !== true
              ? []
              : [new ErrorOverlayPlugin()]),
          ]
        : [
            new webpack.DefinePlugin(toDefine),

            // new webpack.optimize.UglifyJsPlugin({
            //   // @ts-ignore @todo 0
            //   compressor: {warnings: false},
            // }),
          ]),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            ...(options.withReactHotLoading ? [babelForTsHotReloading()] : []),
            {
              loader: require.resolve('ts-loader'),
              options: {
                // useTranspileModule: true,
                transpileOnly: true,
                configFile: require.resolve('../tsconfig.json'),
                compilerOptions: {
                  // ...(options.supportEs5 ? {target: 'es5'} : {}),
                },
              },
            },
          ],
        },
        {
          test: /\.js$/,
          use: {
            loader: require.resolve(`babel-loader`),
            options: {
              forceEnv: `${packageName}:${options.env}`,
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
              babelrc: true,
            },
          },
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          use: require.resolve('babel-loader'),
          include: [path.resolve(__dirname, '../vendor')],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: require.resolve(`style-loader`),
              options: {
                // singleton: true,
                // convertToAbsoluteUrls: true,
                ...(!isDev
                  ? {}
                  : {
                      hmr: true,
                    }),
              },
            },
            {
              loader: require.resolve('typings-for-css-modules-loader'),
              options: {
                sourceMap: isDev,
                modules: true,
                localIdentName: isDev ? '[name]_[local]_[hash:10]' : '[hash:10]', 
                importLoaders: 1,
                namedExport: true,
              },
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                plugins: () => {
                  return [
                    require('postcss-hexrgba')(),
                    require('postcss-nesting')(),
                    require('postcss-short')(),
                  ]
                },
              },
            },
          ],
          exclude: /node_modules/,
        },
        // {
        //   test: /\.html$/,
        //   use: [
        //     {
        //       loader: 'underscore-template-loader',
        //       query: {
        //         engine: 'lodash',
        //       },
        //     },
        //     {
        //       loader: 'html-loader'
        //     }
        //   ],
        //   exclude: /node_modules/,
        // },
        // {test: /\.svg$/, use: require.resolve('svg-inline-loader')},
        // "file" loader makes sure those assets get served by WebpackDevServer.
        // When you `import` an asset, you get its (virtual) filename.
        // In production, they would get copied to the `build` folder.
        // This loader don't uses a "test" so it will catch all modules
        // that fall through the other loaders.
        {
          // Exclude `js` files to keep "css" loader working as it injects
          // it's runtime that would otherwise processed through "file" loader.
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

  if (isDev && options.withDevServer === true) {
    config.output.publicPath = `http://localhost:${
      packageDevSpecificConfig.devServerPort
    }/`

    // @ts-ignore ignore
    config.devServer = {
      host: '0.0.0.0',
      hot: true,
      historyApiFallback: true,
      // inline: true,
      // clientLogLevel: 'error',
      public: `localhost:${packageDevSpecificConfig.devServerPort}`,
      noInfo: false,
      // quiet: true,
      stats: false,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'SourceMap,X-SourceMap',
      },
      port: packageDevSpecificConfig.devServerPort,
    }
  }

  const htmlPluginTemplateParameters = (
    compilation: $FixMe,
    assets: $FixMe,
    options: $FixMe,
  ) => {
    return {
      onv: envConfig,
      compilation: compilation,
      webpack: compilation.getStats().toJson(),
      webpackConfig: compilation.options,
      htmlWebpackPlugin: {
        files: assets,
        options: options,
      },
    }
  }

  return {
    isDev,
    envConfig,
    bundlesDir,
    config,
    srcDir,
    htmlPluginTemplateParameters,
    context,
  }
}
