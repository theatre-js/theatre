import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze} from 'immer'

setAutoFreeze(false)

module.exports = (env: Envs) => {
  const parts = makeConfigParts({
    env,
    withReactHotLoading: true,
    packageName: 'studio',
    withDevServer: true,
    withReactHotLoader: true,
    entries: {
      index: ['./src/studio/index.tsx'],
    },
  })

  return immer(parts.config, c => {
    c.output.libraryTarget = 'umd'
    c.output.library = 'TheaterJS'

    c.plugins.push(
      new HtmlWebpackPlugin({
        inject: 'body',
        template: 'src/studio/index.html',
      }),
    )
  })
}
