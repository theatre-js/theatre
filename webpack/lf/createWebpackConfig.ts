import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze} from 'immer'

setAutoFreeze(false)

module.exports = (env: Envs) => {
  const parts = makeConfigParts({
    env,
    withReactHotLoading: true,
    packageName: 'lf',
    withDevServer: true,
    entries: {
      index: ['./src/lf/index.tsx'],
    },
  })

  return immer(parts.config, c => {
    c.externals = ['electron']
    c.output.libraryTarget = 'commonjs2'
    c.plugins.push(
      new HtmlWebpackPlugin({
        inject: 'body',
        template: 'src/lf/index.html',
      }),
    )
  })
}
