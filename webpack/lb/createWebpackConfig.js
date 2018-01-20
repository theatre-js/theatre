// @flow
import WebpackNotifierPlugin from 'webpack-notifier'
import CleanPlugin from 'clean-webpack-plugin'
import {context, aliases} from '../commons.ts'
import webpack from 'webpack'
import path from 'path'

type Options = {
  env: 'development' | 'production',
}

const bundlesDir = path.join(context, './bundles/lb')

module.exports = (options: Options) => {
  const isDev = options.env === 'development'
  // We set this manually to make it available to external modules imported in lf
  // $FlowIgnore
  process.env.NODE_ENV = options.env

  const config = {
    context: context,
    target: 'electron-main',
    devtool: isDev ? 'cheap-source-map' : 'source-map',
    recordsPath: path.join(bundlesDir, '.temp/records'),
    entry: {
      index: isDev ? ['webpack/hot/poll?100', './src/lb/index.js'] : ['./src/lb/index.js'],
    },
    node: {
      __dirname: true,
      __filename: true,
    },
    // Everything inside node_modules is externalized. Imports with loaders (like 'exec!./commitHash`)
    // are not externalized
    externals: (_: mixed, request: $UnimportantAny, callback: $UnimportantAny) => {
      if (request.match(/webpack\/hot\/poll/)) {
        callback(null, false)
      } else {
        callback(null, !!request.match(/^[a-z\-@0-9]+[^!]*$/))
      }
    },
    output: {
      path: bundlesDir,
      publicPath: './bundles/lb/',
      filename: '[name].js',
      sourceMapFilename: '[file].map.js',
      libraryTarget: 'commonjs2',
    },
    resolve: {
      // fallback: path.join(context, 'node_modules'),
      alias: aliases,
    },
    module: {
      rules: [
        {test: /\.js$/, use: {loader: `babel-loader`, options: {forceEnv: `lb:${options.env}`}}, exclude: /node_modules/},
        {test: /\.(png|jpg|jpeg|gif|webp)$/, use: [{loader: 'file-loader'}]},
      ],
    },
    plugins: [
      new CleanPlugin([bundlesDir], {root: context}),
      new webpack.DefinePlugin({
        // This is only used inside `$root/webpack/env/index.js` and there it is
        // mirrored in process.env.NODE_ENV. So read this value from process.env.NODE_ENV.
        '$$$NODE_ENV': JSON.stringify(options.env),
      }),
      new webpack.ProvidePlugin({
        'process.env': '$root/webpack/env/index.js',
      }),
    ],
  }

  // plugins
  if (isDev) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new WebpackNotifierPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
    )
  } else {
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compressor: {warnings: false},
      })
    )
  }

  return config
}