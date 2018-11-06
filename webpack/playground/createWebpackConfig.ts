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
    entries: {
      index: ['./src/playground/index.tsx'],
    },
  })

  return immer(parts.config, c => {
    c.plugins.push(
      new HtmlWebpackPlugin({
        inject: 'body',
        template: 'src/playground/index.html',
      }),
    )
  })
}
