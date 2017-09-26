// @flow
import WebpackNotifierPlugin from 'webpack-notifier'
import CleanPlugin from 'clean-webpack-plugin'
import {context} from '../commons'
import webpack from 'webpack'
import path from 'path'

type Options = {
  env: 'development' | 'production',
}

const bundlesDir = path.join(context, './bundles/examples')

module.exports = (options: Options) => {
  const isDev = options.env === 'development'

  // $FlowIgnore
  const envConfig = require(path.join(context, `${options.env}.env.json`))

  const config: Object = {
    context: context,
    devtool: isDev ? 'source-map' : 'source-map',
    entry: {
      index: false ? ['react-hot-loader/patch', './examples/index.js'] : ['./examples/index.js'],
    },
    output: {
      path: bundlesDir,
      publicPath: '/',
      filename: '[name].js',
      sourceMapFilename: '[file].map.js',
    },
    module: {
      rules: [
        {test: /\.js$/, use: {loader: `babel-loader`, options: {forceEnv: options.env}}, exclude: /node_modules/},
        {
          test: /\.css$/,
          use: [
            `style-loader`,
            {
              loader: 'css-loader',
              options: {
                sourceMap: isDev,
                modules: true,
                localIdentName: '[name]_[local]_[hash:4]',
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => {
                  return [
                    require('postcss-hexrgba'),
                    require('postcss-nesting'),
                    require('postcss-short'),
                  ]
                },
              },
            },
          ],
          exclude: /node_modules/,
        },
        {test: /\.svg$/, use: 'svg-inline-loader'},
        {test: /\.(png|jpg|jpeg|gif)$/, use: [{loader: 'url-loader', options: {'prefix': 'img/', limit: 5000}}]},
      ],
    },
    plugins: [
      new CleanPlugin([bundlesDir], {root: context}),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(options.env),
      }),
    ],
  }

  // plugins
  if (isDev) {
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new WebpackNotifierPlugin(),
      // new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin(),
    )
  } else {
    config.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compressor: {warnings: false},
      })
    )
  }

  if (isDev) {
    config.devServer = {
      host: '0.0.0.0',
      hot: true,
      historyApiFallback: true,
      inline: true,
      clientLogLevel: 'error',
      noInfo: false,
      quiet: false,
      stats: false,
      port: envConfig.devSpecific.examples.devServerPort,
    }
  }

  return config
}