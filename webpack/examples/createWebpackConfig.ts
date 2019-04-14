import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze} from 'immer'
import * as webpack from 'webpack'

setAutoFreeze(false)

module.exports = (env: Envs) => {
  const parts = makeConfigParts({
    env,
    withReactHotLoading: false,
    packageName: 'examples',
    withDevServer: true,
    entries: {
      'tl/1': ['./examples/tl/1/index.ts'],
      'tl/2': ['./examples/tl/2/index.ts'],
    },
  })

  return immer(parts.config, c => {
    // we got multiple entries with the same name, so let's use [id] here
    c.output.filename = '[id].js'
    c.plugins.push(
      new HtmlWebpackPlugin({
        inject: false,
        template: './examples/index.html',
        filename: 'index.html',
        chunks: [],
      }),
      new HtmlWebpackPlugin({
        inject: false,
        template: './examples/tl/1/index.html',
        filename: 'tl/1/index.html',
        chunks: ['tl/1'],
        templateParameters: parts.htmlPluginTemplateParameters,
      }),
      new HtmlWebpackPlugin({
        inject: false,
        template: './examples/tl/2/index.html',
        filename: 'tl/2/index.html',
        chunks: ['tl/2'],
        templateParameters: parts.htmlPluginTemplateParameters,
      }),
      new webpack.ProvidePlugin({'THREE': 'three'})
    )
  })
}
