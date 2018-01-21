import * as path from 'path'
import * as CleanPlugin from 'clean-webpack-plugin'
import * as WebpackNotifierPlugin from 'webpack-notifier'
import * as webpack from 'webpack'
import * as TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import {mapValues} from 'lodash'

export const context = path.resolve(__dirname, '..')

export const aliases: {[alias: string]: string} = {
  $root: path.join(context, './'),
  $src: path.join(context, './src/'),
  $lb: path.join(context, './src/lb/'),
  $lf: path.join(context, './src/lf/'),
  $studio: path.join(context, './src/studio/'),
  $shared: path.join(context, './src/shared/'),
}

type PackageName = 'studio'

export type Envs = 'development' | 'production'

export type Options = {
  env: 'development' | 'production'
  withReactHotLoading?: boolean
  packageName: PackageName
  entries?: {[key: string]: string[]}
  withReactHotLoader: boolean
}

const babelForTsHotReloading = () => ({
  loader: require.resolve('babel-loader'),
  options: {
    babelrc: false,
    plugins: ['react-hot-loader/babel'],
  },
})

export const makeConfigParts = (options: Options) => {
  const {packageName} = options
  const isDev = options.env === 'development'
  const envConfig = require(path.join(context, `${options.env}.env.json`))
  const bundlesDir = path.join(context, `./bundles/${packageName}`)
  const srcDir = path.join(context, 'src')

  // Don't let this global bother you. It's just a hack to make $root/webpack/env/dotEnvFile.js work
  // both inside a webpack bundle and outside. And that is the only place this global is used.
  // @ts-ignore
  global.$$$NODE_ENV = options.env

  const config: webpack.Configuration & {
    output: webpack.Output,
    plugins: webpack.Plugin[],
    module: webpack.Module,
    resolve: webpack.Resolve,
  } = {
    entry: mapValues(
      options.entries || {},
      ent =>
        options.withReactHotLoader && isDev
          ? ['react-hot-loader/patch'].concat(ent)
          : ent,
    ),
    output: {
      path: bundlesDir,
      filename: '[name].js',
      sourceMapFilename: '[file].map.js',
    },
    context: context,
    devtool: isDev ? 'cheap-module-source-map' : 'source-map',
    resolve: {
      alias: aliases,
      extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: require.resolve('../tsconfig.json'),
      }),
      new CleanPlugin([bundlesDir], {root: context}),
      new webpack.DefinePlugin({
        // This is only used inside `$root/webpack/env/index.js` and there it is
        // mirrored in process.env.NODE_ENV. So read this value from process.env.NODE_ENV.
        $$$NODE_ENV: JSON.stringify(options.env),
      }),
      new webpack.ProvidePlugin({
        'process.env': '$root/webpack/env/index.js',
      }),
      ...(isDev
        ? [
            new webpack.HotModuleReplacementPlugin(),
            new WebpackNotifierPlugin(),
            // new webpack.NoEmitOnErrorsPlugin(),
            new webpack.NamedModulesPlugin(),
          ]
        : [
            new webpack.optimize.UglifyJsPlugin({
              // @ts-ignore @todo 0
              compressor: {warnings: false},
            }),
          ]),
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: srcDir,
          use: [
            ...(options.withReactHotLoading ? [babelForTsHotReloading()] : []),
            {
              loader: require.resolve('ts-loader'),
              options: {
                // useTranspileModule: true,
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.js$/,
          use: {
            loader: require.resolve(`babel-loader`),
            options: {forceEnv: `${packageName}:${options.env}`},
          },
          exclude: /node_modules/,
        },
        {
          test: /\.js$/,
          use: require.resolve('babel-loader'),
          include: [
            path.resolve(__dirname, '../vendor'),
          ],
        },
        {
          test: /\.css$/,
          use: [
            require.resolve(`style-loader`),
            {
              loader: require.resolve('typings-for-css-modules-loader'),
              options: {
                sourceMap: isDev,
                modules: true,
                localIdentName: '[hash:6]_[path]_[name]_[local]',
                importLoaders: 1,
              },
            },
            require.resolve('postcss-loader'),
          ],
          include: srcDir,
        },
        {test: /\.svg$/, use: require.resolve('svg-inline-loader')},
        {
          test: /\.(png|jpg|jpeg|gif)$/,
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {prefix: 'img/', limit: 5000},
            },
          ],
        },
      ],
    },
  }

  return {
    isDev,
    envConfig,
    bundlesDir,
    config,
    srcDir,
  }
}
