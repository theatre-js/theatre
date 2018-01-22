import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze} from 'immer'

setAutoFreeze(false)

module.exports = (env: Envs) => {
  const parts = makeConfigParts({
    env,
    withReactHotLoading: true,
    packageName: 'playground',
    withDevServer: true,
    withReactHotLoader: true,
    entries: {
      index: ['./src/playground/index.tsx'],
    },
  })

  return immer(parts.config, c => {
    // c.output.publicPath = `http://localhost:${
    //   parts.envConfig.devSpecific.playground.devServerPort
    // }/`

    c.plugins.push(
      new HtmlWebpackPlugin({
        inject: 'body',
        template: 'src/playground/index.html',
      }),
    )
  })
}
