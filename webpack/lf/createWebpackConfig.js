// @flow
import WebpackNotifierPlugin from 'webpack-notifier'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CleanPlugin from 'clean-webpack-plugin'
import {context, aliases} from '../commons'
import webpack from 'webpack'
import path from 'path'

type Options = {
  env: 'development' | 'production',
}

const bundlesDir = path.join(context, './bundles/lf')

module.exports = (options: Options) => {
  const isDev = options.env === 'development'

  // Don't let this global bother you. It's just a hack to make $root/webpack/env/dotEnvFile.js work
  // both inside a webpack bundle and outside. And that is the only place this global is used.
  global.$$$NODE_ENV = options.env

  // $FlowIgnore
  const envConfig = require(path.join(context, `${options.env}.env.json`))

  const config: Object = {
    context: context,
    // target: '',
    devtool: isDev ? 'source-map' : 'source-map',
    entry: {
      index: isDev ? ['react-hot-loader/patch', './src/lf/index.js'] : ['./src/lf/index.js'],
    },
    externals: ['electron'],
    output: {
      path: bundlesDir,
      libraryTarget: 'commonjs2',
      publicPath: '/',
      filename: '[name].js',
      sourceMapFilename: '[file].map.js',
    },
    resolve: {
      // fallback: path.join(context, 'node_modules'),
      alias: aliases,
    },
    module: {
      rules: [
        {test: /\.js$/, use: {loader: `babel-loader`, options: {forceEnv: `lf:${options.env}`}}, exclude: /node_modules/},
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
          include: path.join(context, 'src'),
        },
        {test: /\.svg$/, use: 'svg-inline-loader'},
        {test: /\.(png|jpg|jpeg|gif)$/, use: [{loader: 'url-loader', options: {'prefix': 'img/', limit: 5000}}]},
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
      new HtmlWebpackPlugin({
        inject: 'body',
        template: 'src/lf/index.html',
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

  if (isDev) {
    config.devServer = {
      host: '0.0.0.0',
      hot: true,
      historyApiFallback: true,
      inline: true,
      noInfo: true,
      quiet: true,
      stats: false,
      port: envConfig.devSpecific.launcherFrontend.devServerPort,
    }
  }

  return config
}