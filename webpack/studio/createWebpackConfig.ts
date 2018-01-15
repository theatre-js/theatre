import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze} from 'immer'

setAutoFreeze(false)

module.exports = (env: Envs) => {
  const parts = makeConfigParts({env, withReactHotLoading: true, packageName: 'studio'})

  return immer(parts.config, c => {
    c.entry = {
      index: parts.isDev
        ? ['react-hot-loader/patch', './src/studio/index.tsx']
        : ['./src/studio/index.tsx'],
    }

    c.output.libraryTarget = 'umd'
    c.output.library = 'TheaterJS'
    c.output.publicPath = `http://localhost:${
      parts.envConfig.devSpecific.studio.devServerPort
    }/`

    c.plugins.push(
      new HtmlWebpackPlugin({
        inject: 'body',
        template: 'src/studio/index.html',
      }),
    )

    if (parts.isDev) {
      c.devServer = {
        host: '0.0.0.0',
        hot: true,
        historyApiFallback: true,
        inline: true,
        // clientLogLevel: 'error',
        public: `localhost:${parts.envConfig.devSpecific.studio.devServerPort}`,
        noInfo: false,
        quiet: false,
        stats: false,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Expose-Headers': 'SourceMap,X-SourceMap',
        },
        port: parts.envConfig.devSpecific.studio.devServerPort,
      }
    }
  })
}
